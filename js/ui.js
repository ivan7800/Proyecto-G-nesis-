import { BIOMES, CONFIG, GENE_LABELS } from './config.js?v=6.0.1';
import { formatNumber, hsl, downloadJSON } from './utils.js?v=6.0.1';
import { clearSavedWorld, deleteSlot, getStats, listSlots, loadWorld, recordStats, saveWorld } from './storage.js?v=6.0.1';
import { SKILLS, deriveSkill, obraToFile, collectionToFile, OBRA_META } from './workshop.js?v=6.0.1';
import { randomGenome } from './genetics.js?v=6.0.1';
import { archetypeFor, archetypeName } from './eldritch-sprites.js?v=6.0.1';
import { TECHNOLOGY_TREE } from './civilization.js?v=6.0.1';
import { GRAND_PROJECT_TYPES } from './grand-projects.js?v=6.0.1';

const TOOL_COPY = Object.freeze({
  inspect: ['Inspeccionar', 'Pulsa sobre una criatura para ver su ADN.'],
  food: ['Sembrar energía', 'Pulsa en el mundo para añadir alimento.'],
  spawn: ['Crear vida', 'Pulsa en el mundo para colocar un huevo programado.'],
  radiation: ['Radiación', 'Pulsa en el mundo para mutar organismos cercanos.'],
  meteor: ['Meteorito', 'Pulsa en el mundo para provocar una extinción local.'],
  sanctuary: ['Santuario', 'Pulsa en el mundo para crear una zona fértil.']
});

export class UI {
  constructor(simulation, renderer) {
    this.simulation = simulation;
    this.renderer = renderer;
    this.selectedId = null;
    this.selectedGrandProjectId = null;
    this.currentTool = 'inspect';
    this.deferredInstall = null;
    this.lastPopulation = 0;
    this.toastTimer = null;
    this.armedGenome = null;
    this.serviceWorkerRegistration = null;
    this.recognition = null;
    this.isListening = false;
    this.cameraPointers = new Map();
    this.pinchState = null;
    this.lastAutoSpeechKey = '';
    this.autoSpeak = readBooleanSetting('genesis-auto-speak', false);
    this.masterVolume = readNumberSetting('genesis-volume', .8, 0, 1);
    this.qualityMode = readStringSetting('genesis-quality', 'auto', ['auto', 'alta', 'rendimiento']);
    this.renderer.setQualityMode(this.qualityMode);
    this.els = collectRequiredElements();
    this.bind();
    this.bindGenesis();
    this.renderTimeline();
    this.updateControlsFromSimulation();
    this.activateTool('inspect', false);
    this.updatePause();
    this.updateSpeechSupport();
    this.audioContext = null;
    this.simulation.workshop.onObra = obra => {
      this.toast(`Obra terminada: ${obra.title}`);
      this.renderObras();
    };
    this.renderObras();
    this.renderCollective();
    this.renderCivilization();
    this.renderLegacy();
    this.simulation.grandProjects.onChange = project => {
      if (!this.selectedGrandProjectId) this.selectedGrandProjectId = project.id;
      this.renderGrandProjects();
    };
    this.renderGrandProjects();
  }

  get selected() {
    if (!this.selectedId) return null;
    return this.simulation.creatures.find(creature => creature?.id === this.selectedId) ?? null;
  }

  bind() {
    this.els.pauseBtn.addEventListener('click', () => {
      if (this.simulation.genesis?.phase === 'dormant') { this.els.startGenesisBtn.click(); return; }
      this.simulation.paused = !this.simulation.paused;
      this.updatePause();
    });

    document.querySelectorAll('.speed-btn').forEach(button => button.addEventListener('click', () => {
      this.simulation.speed = Number(button.dataset.speed) || 1;
      this.updateSpeedButtons();
      this.toast(`Velocidad de simulación: ${this.simulation.speed}×`);
    }));

    document.querySelectorAll('.tab').forEach(button => button.addEventListener('click', () => this.activateTab(button.dataset.tab)));
    document.querySelectorAll('.tool-btn').forEach(button => button.addEventListener('click', () => this.activateTool(button.dataset.tool)));

    this.els.deliverAllBtn.addEventListener('click', () => {
      const obras = this.simulation.workshop.obras;
      if (!obras.length) return;
      const file = collectionToFile(obras, this.simulation);
      this.downloadFile(file);
      for (const obra of obras) obra.delivered = true;
      this.renderObras();
      this.toast(`Códice completo entregado: ${obras.length} obras`);
    });

    this.els.obraList.addEventListener('click', event => {
      const target = event.target.closest('button[data-obra]');
      if (!target) return;
      const obra = this.simulation.workshop.obras.find(item => item.id === target.dataset.obra);
      if (!obra) return;
      if (target.dataset.action === 'deliver') {
        this.downloadFile(obraToFile(obra));
        obra.delivered = true;
        this.renderObras();
        this.toast(`Obra entregada: ${obra.title}`);
      } else if (target.dataset.action === 'play') {
        this.playSong(obra, target);
      }
    });

    this.els.mutationRange.addEventListener('input', event => {
      this.simulation.environmentMutation = Number(event.target.value);
      this.els.mutationOutput.textContent = `${this.simulation.environmentMutation.toFixed(1)}×`;
    });
    this.els.foodRange.addEventListener('input', event => {
      this.simulation.foodAbundance = Number(event.target.value);
      this.els.foodOutput.textContent = `${this.simulation.foodAbundance.toFixed(1)}×`;
    });
    this.els.biomeSelect.addEventListener('change', event => {
      const changed = this.simulation.setBiome(event.target.value);
      this.updateEnvironmentControls();
      if (changed) this.toast(`Nuevo bioma: ${this.simulation.getBiome().label}`);
    });
    this.els.biomeQuickSelect.addEventListener('change', event => {
      const changed = this.simulation.setBiome(event.target.value);
      this.updateEnvironmentControls();
      if (changed) this.toast(`Nuevo bioma: ${this.simulation.getBiome().label}`);
    });
    this.els.autoBiomeToggle.addEventListener('change', event => {
      this.simulation.autoBiome = Boolean(event.target.checked);
      this.simulation.lastBiomeCycleYear = this.simulation.year;
      this.toast(this.simulation.autoBiome ? 'Ciclo autónomo de biomas activado' : 'Bioma fijado manualmente');
    });
    this.els.autonomyRange.addEventListener('input', event => {
      this.simulation.setAutonomy(Number(event.target.value) / 100);
      this.els.autonomyOutput.textContent = `${Math.round(this.simulation.autonomyLevel * 100)}%`;
    });
    this.els.autoSpeakToggle.checked = this.autoSpeak;
    this.els.autoSpeakToggle.addEventListener('change', event => {
      this.autoSpeak = Boolean(event.target.checked);
      writeBooleanSetting('genesis-auto-speak', this.autoSpeak);
      this.lastAutoSpeechKey = '';
      this.toast(this.autoSpeak ? 'Voz autónoma activada para la criatura seleccionada' : 'Voz autónoma desactivada');
    });

    this.els.volumeSlider.value = String(Math.round(this.masterVolume * 100));
    this.els.volumeLabel.textContent = `${Math.round(this.masterVolume * 100)}%`;
    this.els.volumeSlider.addEventListener('input', event => {
      const percent = Math.min(100, Math.max(0, Number(event.target.value) || 0));
      this.masterVolume = percent / 100;
      this.els.volumeLabel.textContent = `${percent}%`;
      writeNumberSetting('genesis-volume', this.masterVolume);
    });

    this.els.qualitySelect.value = this.qualityMode;
    this.els.qualitySelect.addEventListener('change', event => {
      const mode = ['auto', 'alta', 'rendimiento'].includes(event.target.value) ? event.target.value : 'auto';
      this.qualityMode = mode;
      this.renderer.setQualityMode(mode);
      writeStringSetting('genesis-quality', mode);
      const labels = { auto: 'Calidad automática', alta: 'Calidad alta', rendimiento: 'Modo rendimiento activado' };
      this.toast(labels[mode]);
    });

    this.els.injectAtlasBtn.addEventListener('click', () => {
      const result = this.simulation.injectKnowledgeAtlas();
      this.renderCollective();
      this.toast(`Atlas sincronizado: ${result.learned} aprendizajes reforzados`);
    });
    this.els.collectiveProjectBtn.addEventListener('click', () => {
      const prompt = this.els.collectivePrompt.value.trim();
      if (!prompt) { this.toast('Describe primero qué quieres que cree la especie'); this.els.collectivePrompt.focus(); return; }
      const request = this.simulation.requestCollectiveProject(this.els.collectiveProjectType.value, prompt);
      this.els.collectivePrompt.value = '';
      this.renderCollective();
      this.activateTab('collective');
      this.toast(`Encargo enviado: ${request.prompt}`);
    });
    this.els.openCollectiveBtn.addEventListener('click', () => this.activateTab('collective'));
    this.els.openGrandProjectBtn.addEventListener('click', () => this.activateTab('grandproject'));
    this.els.openCivilizationBtn.addEventListener('click', () => this.activateTab('civilization'));
    this.els.openLegacyBtn.addEventListener('click', () => this.activateTab('legacy'));
    this.els.openArchiveBtn.addEventListener('click', () => this.activateTab('archive'));

    this.els.grandProjectCreateBtn.addEventListener('click', () => {
      try {
        const project = this.simulation.grandProjects.createProject(
          this.els.grandProjectType.value,
          this.els.grandProjectTitle.value,
          this.els.grandProjectBrief.value,
          this.els.grandProjectConstraints.value,
          this.simulation
        );
        this.selectedGrandProjectId = project.id;
        this.els.grandProjectTitle.value = '';
        this.els.grandProjectBrief.value = '';
        this.els.grandProjectConstraints.value = '';
        this.renderGrandProjects();
        this.activateTab('grandproject');
        this.toast(`Gran Proyecto convocado: ${project.title}`);
      } catch (error) {
        this.toast(error.message || 'No se pudo iniciar el proyecto');
      }
    });
    this.els.grandProjectList.addEventListener('click', event => {
      const button = event.target.closest('button[data-grand-project]');
      if (!button) return;
      this.selectedGrandProjectId = button.dataset.grandProject;
      this.renderGrandProjects();
    });
    this.els.grandProjectPauseBtn.addEventListener('click', () => {
      const project = this.simulation.grandProjects.find(this.selectedGrandProjectId);
      if (!project) return;
      if (project.status === 'paused') this.simulation.grandProjects.resume(project.id);
      else this.simulation.grandProjects.pause(project.id);
      this.renderGrandProjects();
    });
    this.els.grandProjectDossierBtn.addEventListener('click', () => {
      const project = this.simulation.grandProjects.find(this.selectedGrandProjectId);
      if (!project) return;
      const content = this.simulation.grandProjects.buildDossier(project.id, this.simulation);
      this.downloadFile({ filename: `${safeFilename(project.title)}-Dossier-Omega.md`, mime: 'text/markdown', content });
      project.delivered = true;
      this.renderGrandProjects();
      this.toast('Dossier del Gran Proyecto exportado');
    });
    this.els.grandProjectContextBtn.addEventListener('click', () => {
      const project = this.simulation.grandProjects.find(this.selectedGrandProjectId);
      if (!project) return;
      const content = this.simulation.grandProjects.buildContext(project.id, this.simulation);
      this.downloadFile({ filename: `${safeFilename(project.title)}-Contexto-IA.txt`, mime: 'text/plain', content });
      this.toast('Contexto trazable para IA externa exportado');
    });
    this.els.grandProjectCancelBtn.addEventListener('click', () => {
      const project = this.simulation.grandProjects.find(this.selectedGrandProjectId);
      if (!project || project.status === 'completed') return;
      if (!confirm(`¿Archivar «${project.title}»?`)) return;
      this.simulation.grandProjects.cancel(project.id, this.simulation);
      this.renderGrandProjects();
      this.toast('Proyecto archivado');
    });
    this.els.grandProjectIntegrateBtn.addEventListener('click', () => {
      const text = this.els.grandProjectExternalInput.value;
      const result = this.simulation.grandProjects.integrateInsight(this.selectedGrandProjectId, text, this.simulation);
      if (!result.accepted) { this.toast(result.reason || 'No se pudo integrar'); return; }
      this.els.grandProjectExternalInput.value = '';
      this.renderGrandProjects();
      this.toast(`${result.fragments} ideas revisadas integradas`);
    });

    this.els.exportOracleBtn.addEventListener('click', () => {
      const content = this.simulation.civilization.buildAIContext(this.simulation, this.els.oracleQuestion.value);
      this.downloadFile({ filename: `Genesis-Omega-Contexto-IA-Ano-${this.simulation.year.toFixed(1).replace('.', '-')}.txt`, mime: 'text/plain', content });
      this.els.oracleStatus.textContent = 'Paquete exportado. Consúltalo manualmente y revisa la respuesta antes de integrarla.';
      this.toast('Paquete de contexto para IA externa exportado');
    });
    this.els.integrateOracleBtn.addEventListener('click', () => {
      const result = this.simulation.civilization.absorbExternalWisdom(this.els.oracleResponse.value, this.simulation);
      if (!result.accepted) { this.toast(result.reason || 'No se pudo integrar la respuesta'); return; }
      this.els.oracleResponse.value = '';
      this.els.oracleStatus.textContent = `${result.fragments} ideas validadas; ${result.learned} aprendizajes individuales reforzados.`;
      this.renderCivilization();
      this.renderCollective();
      this.toast('Sabiduría externa revisada e integrada');
    });

    this.bindProgramEditor();

    this.els.pulseBtn.addEventListener('click', () => {
      const mutations = this.simulation.evolutionaryPulse();
      this.toast(`Pulso evolutivo: ${mutations} genomas alterados`);
    });

    this.els.resetBtn.addEventListener('click', () => {
      if (!confirm('¿Reiniciar el mundo? La instantánea guardada no se borrará.')) return;
      this.simulation.reset();
      this.renderer.resetCamera();
      this.els.genesisIntro.hidden = false;
      this.clearSelection();
      this.updateControlsFromSimulation();
      this.updateMetrics(60);
      this.renderTimeline();
      this.toast('Nuevo mundo generado');
    });

    this.els.cameraResetBtn.addEventListener('click', () => {
      this.renderer.resetCamera();
      this.els.followBtn.textContent = 'Seguir organismo';
      this.updateCameraReadout();
      this.toast('Mundo completo encajado');
    });
    this.els.cameraZoomOutBtn.addEventListener('click', () => this.zoomFromCenter(.8));
    this.els.cameraZoomInBtn.addEventListener('click', () => this.zoomFromCenter(1.25));

    this.els.cinemaBtn.addEventListener('click', () => this.toggleCinema());
    this.els.cinemaExitBtn.addEventListener('click', () => this.toggleCinema(false));

    this.els.helpBtn.addEventListener('click', () => {
      if (typeof this.els.helpDialog.showModal === 'function') this.els.helpDialog.showModal();
      else this.els.helpDialog.setAttribute('open', '');
    });

    this.els.followBtn.addEventListener('click', () => {
      const selected = this.selected;
      if (!selected) { this.clearSelection(); return; }
      const isFollowing = this.renderer.followId === selected.id;
      if (isFollowing) this.renderer.clearFollow();
      else this.renderer.setFollow(selected.id);
      this.els.followBtn.textContent = isFollowing ? 'Seguir organismo' : 'Dejar de seguir';
    });

    this.els.teachForm.addEventListener('submit', event => {
      event.preventDefault();
      const text = this.els.teachInput.value.trim();
      if (!text) { this.toast('Escribe una pregunta o una regla'); return; }
      this.els.teachInput.value = '';
      this.interactWithSelected(text, true);
    });
    this.els.listenBtn.addEventListener('click', () => this.startListening());
    this.els.speakBtn.addEventListener('click', () => {
      const selected = this.selected;
      if (!selected) { this.toast('Selecciona primero una criatura'); return; }
      const last = [...selected.dialogue].reverse().find(item => item.role === 'creature')?.text;
      const text = last || `Soy ${selected.name}. Estoy ${selected.state} y puedo aprender de ti.`;
      selected.lastSpeech = text;
      selected.speechUntil = this.simulation.time + 7;
      this.speakText(text, selected);
    });

    this.els.saveBtn.addEventListener('click', () => this.save());
    this.els.quickSaveBtn.addEventListener('click', () => this.save());
    this.els.loadBtn.addEventListener('click', () => this.load());
    this.els.quickLoadBtn.addEventListener('click', () => this.load());
    this.els.clearSaveBtn.addEventListener('click', () => this.clearSave());
    const exportWorld = () => {
      try {
        downloadJSON(this.simulation.serialize(), `genesis-omega-${Date.now()}.json`);
        this.toast('Mundo exportado');
      } catch (error) {
        console.error(error);
        this.toast('No se pudo exportar el mundo');
      }
    };
    this.els.exportBtn.addEventListener('click', exportWorld);
    this.els.quickExportBtn.addEventListener('click', exportWorld);
    this.els.importInput.addEventListener('change', event => this.importFile(event.target.files?.[0]));
    this.els.quickImportInput.addEventListener('change', event => this.importFile(event.target.files?.[0]));
    this.els.downloadAllSavesBtn.addEventListener('click', () => this.downloadAllSaves().catch(error => {
      console.error(error);
      this.toast('No se pudo crear la copia de seguridad');
    }));
    this.els.worldCanvas.addEventListener('click', event => this.onWorldClick(event));

    this.bindCamera();
    this.bindInstall();

    this.simulation.onEvent = () => this.renderTimeline();
    this.simulation.onSelectionInvalidated = id => {
      if (this.selectedId === id) this.clearSelection();
    };
  }

  bindGenesis() {
    this.els.startGenesisBtn.addEventListener('click', () => {
      if (!this.simulation.beginGenesis()) return;
      this.els.genesisIntro.hidden = true;
      this.updatePause();
      this.updateGenesisPanel();
      this.toast('Protocolo iniciado: Ω-001 está despertando');
    });
    this.simulation.onHatch = (creature, egg) => {
      this.updateGenesisPanel();
      if (egg?.founder) {
        this.selectCreature(creature);
        this.renderer.setFollow(creature.id);
        this.renderer.setZoom(Math.max(this.renderer.camera.zoom, 1.45));
        this.updateCameraReadout();
        this.toast('Ω-001 ha nacido. Háblale desde el panel Ciencia.');
      } else {
        this.toast(`${creature.entityCode || creature.name} ha nacido`);
      }
    };
  }

  bindProgramEditor() {
    const profiles = {
      explorer: { name: 'Linaje Explorador', hue: 190, speed: 1.35, vision: 195, sociability: .45, curiosity: .9, aggression: .18, efficiency: 1.05, note: 'Explora, recuerda e imita rutas fértiles.' },
      cooperative: { name: 'Linaje Cooperativo', hue: 145, speed: 1.05, vision: 155, sociability: .92, curiosity: .58, aggression: .05, efficiency: 1.2, note: 'Comparte información y permanece cerca del grupo.' },
      survivor: { name: 'Linaje Superviviente', hue: 48, speed: .88, vision: 130, sociability: .52, curiosity: .35, aggression: .15, efficiency: 1.5, note: 'Consume poco, vive más y resiste épocas de escasez.' },
      predator: { name: 'Linaje Depredador', hue: 350, speed: 1.75, vision: 175, sociability: .2, curiosity: .62, aggression: .95, efficiency: .82, note: 'Rápido, territorial y costoso de mantener.' },
      balanced: { name: 'Linaje Equilibrado', hue: 275, speed: 1.15, vision: 150, sociability: .58, curiosity: .62, aggression: .28, efficiency: 1.12, note: 'Sin extremos; adaptable a cambios graduales.' }
    };
    const fields = {
      speed: ['progSpeed', 'progSpeedOut', 2], vision: ['progVision', 'progVisionOut', 0],
      sociability: ['progSocial', 'progSocialOut', 2], curiosity: ['progCuriosity', 'progCuriosityOut', 2],
      aggression: ['progAggression', 'progAggressionOut', 2], efficiency: ['progEfficiency', 'progEfficiencyOut', 2]
    };

    const refresh = () => {
      for (const [, [inputId, outputId, decimals]] of Object.entries(fields)) {
        this.els[outputId].textContent = Number(this.els[inputId].value).toFixed(decimals);
      }
    };

    const applyProfile = key => {
      const profile = profiles[key] ?? profiles.explorer;
      for (const [gene, [inputId]] of Object.entries(fields)) this.els[inputId].value = profile[gene];
      this.els.programName.textContent = profile.name;
      this.els.programNote.textContent = profile.note;
      this.els.programOrb.style.background = hsl(profile.hue, 82, 62);
      this.els.programOrb.style.boxShadow = `0 0 24px ${hsl(profile.hue, 82, 62, .55)}`;
      refresh();
    };

    this.els.profileSelect.addEventListener('change', event => applyProfile(event.target.value));
    for (const [, [inputId]] of Object.entries(fields)) this.els[inputId].addEventListener('input', refresh);
    this.els.armLineageBtn.addEventListener('click', () => {
      const profile = profiles[this.els.profileSelect.value] ?? profiles.explorer;
      const genome = randomGenome(profile.hue);
      genome.speed = Number(this.els.progSpeed.value);
      genome.vision = Number(this.els.progVision.value);
      genome.sociability = Number(this.els.progSocial.value);
      genome.curiosity = Number(this.els.progCuriosity.value);
      genome.aggression = Number(this.els.progAggression.value);
      genome.efficiency = Number(this.els.progEfficiency.value);
      if (this.els.profileSelect.value === 'survivor') { genome.metabolism = .58; genome.longevity = 132; }
      if (this.els.profileSelect.value === 'predator') { genome.size = 6.8; genome.metabolism = 1.42; }
      if (this.els.profileSelect.value === 'cooperative') { genome.memory = .92; genome.fertility = 1.18; }
      this.armedGenome = genome;
      this.activateTool('spawn', false);
      this.activateTab('god');
      this.toast('Huevo armado: pulsa en el mundo para iniciar su incubación');
    });
    applyProfile('explorer');
  }

  bindCamera() {
    const canvas = this.els.worldCanvas;
    const pointerList = () => [...this.cameraPointers.values()];
    const pointerDistance = points => Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
    const pointerCenter = points => ({ x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 });

    canvas.addEventListener('wheel', event => {
      event.preventDefault();
      this.renderer.clearFollow();
      this.els.followBtn.textContent = 'Seguir organismo';
      const factor = Math.exp(-Math.max(-180, Math.min(180, event.deltaY)) * .0018);
      this.renderer.zoomAt(event.clientX, event.clientY, factor);
      this.updateCameraReadout();
    }, { passive: false });

    canvas.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      canvas.focus({ preventScroll: true });
      this.cameraPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      this.renderer.dragging = true;
      this.renderer.lastPointer = { x: event.clientX, y: event.clientY, moved: false };
      try { canvas.setPointerCapture(event.pointerId); } catch { /* Captura no disponible. */ }
      const points = pointerList();
      if (points.length >= 2) {
        const center = pointerCenter(points);
        this.pinchState = {
          distance: Math.max(1, pointerDistance(points)),
          zoom: this.renderer.camera.zoom,
          world: this.renderer.screenToWorld(center.x, center.y)
        };
        this.renderer.lastPointer.moved = true;
      }
    });

    canvas.addEventListener('pointermove', event => {
      if (!this.cameraPointers.has(event.pointerId)) return;
      this.cameraPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const points = pointerList();
      if (points.length >= 2) {
        if (!this.pinchState) {
          const center = pointerCenter(points);
          this.pinchState = {
            distance: Math.max(1, pointerDistance(points)),
            zoom: this.renderer.camera.zoom,
            world: this.renderer.screenToWorld(center.x, center.y)
          };
        }
        const center = pointerCenter(points);
        const ratio = pointerDistance(points) / Math.max(1, this.pinchState.distance);
        const nextZoom = Math.max(this.renderer.getMinZoom(), Math.min(this.renderer.getMaxZoom(), this.pinchState.zoom * ratio));
        const rect = canvas.getBoundingClientRect();
        this.renderer.camera.zoom = nextZoom;
        this.renderer.camera.x = this.pinchState.world.x - (center.x - rect.left - rect.width / 2) / nextZoom;
        this.renderer.camera.y = this.pinchState.world.y - (center.y - rect.top - rect.height / 2) / nextZoom;
        this.renderer.clampCamera();
        this.renderer.clearFollow();
        this.els.followBtn.textContent = 'Seguir organismo';
        if (this.renderer.lastPointer) this.renderer.lastPointer.moved = true;
        this.updateCameraReadout();
        return;
      }

      if (!this.renderer.dragging || !this.renderer.lastPointer) return;
      const dx = event.clientX - this.renderer.lastPointer.x;
      const dy = event.clientY - this.renderer.lastPointer.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) {
        this.renderer.clearFollow();
        this.els.followBtn.textContent = 'Seguir organismo';
        this.renderer.camera.x -= dx / this.renderer.camera.zoom;
        this.renderer.camera.y -= dy / this.renderer.camera.zoom;
        this.renderer.clampCamera();
        this.renderer.lastPointer = { x: event.clientX, y: event.clientY, moved: true };
      }
    });

    const endPointer = event => {
      this.cameraPointers.delete(event.pointerId);
      if (this.cameraPointers.size < 2) this.pinchState = null;
      if (this.cameraPointers.size === 0) this.renderer.dragging = false;
      try { canvas.releasePointerCapture(event.pointerId); } catch { /* Captura inexistente. */ }
    };
    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);
    canvas.addEventListener('lostpointercapture', endPointer);

    canvas.addEventListener('keydown', event => {
      const pan = 90 / this.renderer.camera.zoom;
      if (event.key === 'ArrowLeft') this.renderer.camera.x -= pan;
      else if (event.key === 'ArrowRight') this.renderer.camera.x += pan;
      else if (event.key === 'ArrowUp') this.renderer.camera.y -= pan;
      else if (event.key === 'ArrowDown') this.renderer.camera.y += pan;
      else if (event.key === '+' || event.key === '=') this.zoomFromCenter(1.2);
      else if (event.key === '-' || event.key === '_') this.zoomFromCenter(.83);
      else if (event.key === '0') this.renderer.resetCamera();
      else if (event.key === 'Enter') {
        const rect = canvas.getBoundingClientRect();
        this.onWorldClick({ clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 });
      } else return;
      this.renderer.clampCamera();
      this.updateCameraReadout();
      event.preventDefault();
    });

    const tabs = [...document.querySelectorAll('.tab')];
    tabs.forEach((tab, index) => tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      tabs[next].focus();
      this.activateTab(tabs[next].dataset.tab);
    }));
  }

  zoomFromCenter(factor) {
    const rect = this.els.worldCanvas.getBoundingClientRect();
    this.renderer.clearFollow();
    this.els.followBtn.textContent = 'Seguir organismo';
    this.renderer.zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
    this.updateCameraReadout();
  }

  updateCameraReadout() {
    const percent = Math.round(this.renderer.camera.zoom * 100);
    this.els.cameraZoomLabel.textContent = `${percent}%`;
    const atMin = this.renderer.camera.zoom <= this.renderer.getMinZoom() * 1.015;
    const atMax = this.renderer.camera.zoom >= this.renderer.getMaxZoom() * .985;
    this.els.cameraZoomOutBtn.disabled = atMin;
    this.els.cameraZoomInBtn.disabled = atMax;
  }

  bindInstall() {
    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault();
      this.deferredInstall = event;
      this.els.installBtn.hidden = false;
    });
    window.addEventListener('appinstalled', () => {
      this.deferredInstall = null;
      this.els.installBtn.hidden = true;
      this.toast('Proyecto Génesis Ω instalado');
    });
    this.els.installBtn.addEventListener('click', async () => {
      if (!this.deferredInstall) {
        this.toast('La instalación no está disponible en este navegador');
        return;
      }
      this.deferredInstall.prompt();
      await this.deferredInstall.userChoice;
      this.deferredInstall = null;
      this.els.installBtn.hidden = true;
    });
  }

  configureServiceWorker(registration) {
    this.serviceWorkerRegistration = registration;
    if (registration?.waiting) this.showUpdateAvailable();
    registration?.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) this.showUpdateAvailable();
      });
    });
    this.els.updateBtn.addEventListener('click', () => {
      const worker = this.serviceWorkerRegistration?.waiting;
      if (!worker) { location.reload(); return; }
      worker.postMessage({ type: 'SKIP_WAITING' });
    }, { once: true });
    let refreshing = false;
    navigator.serviceWorker?.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      location.reload();
    });
  }

  showUpdateAvailable() {
    this.els.updateBtn.hidden = false;
    this.els.saveState.textContent = 'Actualización disponible';
  }

  activateTool(name, announce = true) {
    const safeName = TOOL_COPY[name] ? name : 'inspect';
    this.currentTool = safeName;
    document.querySelectorAll('.tool-btn').forEach(button => {
      const active = button.dataset.tool === safeName;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const [label, hint] = TOOL_COPY[safeName];
    this.els.activeToolLabel.textContent = label;
    this.els.toolHint.textContent = hint;
    this.els.worldCanvas.dataset.tool = safeName;
    if (announce) this.toast(`${label}: ${hint}`);
  }

  onWorldClick(event) {
    if (this.renderer.lastPointer?.moved) {
      this.renderer.lastPointer = null;
      return;
    }
    this.renderer.lastPointer = null;
    const point = this.renderer.screenToWorld(event.clientX, event.clientY);
    const tool = this.currentTool;
    if (tool === 'food') { this.simulation.addFoodBurst(point.x, point.y); this.toast('Energía sembrada'); return; }
    if (tool === 'spawn') {
      const speciesId = this.simulation.spawnCreature(point.x, point.y, this.armedGenome);
      this.toast(speciesId ? `Huevo del Linaje ${String(speciesId).padStart(2, '0')} incubándose` : 'Límite de población alcanzado');
      return;
    }
    if (tool === 'radiation') { this.toast(`${this.simulation.applyRadiation(point.x, point.y)} organismos mutados`); return; }
    if (tool === 'meteor') { this.toast(`Impacto registrado: ${this.simulation.applyMeteor(point.x, point.y)} bajas`); return; }
    if (tool === 'sanctuary') { this.simulation.addSanctuary(point.x, point.y); this.toast('Santuario establecido'); return; }

    let nearestEgg = null;
    let bestEgg = Infinity;
    for (const egg of this.simulation.eggs ?? []) {
      const distance = (egg.x - point.x) ** 2 + (egg.y - point.y) ** 2;
      const hitRadius = Math.max(30 / this.renderer.camera.zoom, egg.founder ? 34 : 27);
      if (distance < hitRadius ** 2 && distance < bestEgg) { bestEgg = distance; nearestEgg = egg; }
    }
    if (nearestEgg) {
      const duration = Number.isFinite(nearestEgg.hatchAt) ? Math.max(.1, nearestEgg.hatchAt - nearestEgg.laidAt) : 1;
      const progress = Number.isFinite(nearestEgg.hatchAt) ? Math.round(Math.max(0, Math.min(1, (this.simulation.time - nearestEgg.laidAt) / duration)) * 100) : 0;
      this.toast(`${nearestEgg.entityCode || 'Huevo Ω'} · incubación ${progress}%`);
      return;
    }

    let nearest = null;
    let best = Infinity;
    for (const creature of this.simulation.creatureGrid.query(point.x, point.y, 70 / this.renderer.camera.zoom)) {
      if (!creature) continue;
      const distance = (creature.x - point.x) ** 2 + (creature.y - point.y) ** 2;
      const hitRadius = Math.max(24 / this.renderer.camera.zoom, Number(creature.visualRadius) || creature.radius * 4);
      if (distance < hitRadius ** 2 && distance < best) { best = distance; nearest = creature; }
    }
    if (nearest) this.selectCreature(nearest);
    else { this.clearSelection(); this.toast('No hay ningún organismo en ese punto'); }
  }

  selectCreature(creature) {
    if (!creature?.id) return this.clearSelection();
    this.selectedId = creature.id;
    this.renderer.selectedId = creature.id;
    this.activateTab('science');
    this.renderInspector();
  }

  clearSelection() {
    this.selectedId = null;
    this.selectedGrandProjectId = null;
    this.renderer.selectedId = null;
    this.renderer.clearFollow();
    this.els.followBtn.textContent = 'Seguir organismo';
    this.els.selectionEmpty.hidden = false;
    this.els.creatureInspector.hidden = true;
  }

  renderInspector() {
    const creature = this.selected;
    if (!creature || creature.dead || !creature.genome) return this.clearSelection();
    this.els.selectionEmpty.hidden = true;
    this.els.creatureInspector.hidden = false;
    const speciesName = archetypeName(creature._archetype || (creature._archetype = archetypeFor(creature)));
    this.els.creatureName.textContent = creature.name || `Entidad ${String(creature.id).slice(-5).toUpperCase()}`;
    this.els.creatureMeta.textContent = `${speciesName} · Linaje ${String(creature.speciesId).padStart(2, '0')} · Gen. ${creature.generation} · ${creature.lifeStage} · ${creature.state || 'explorar'}`;
    this.renderer.drawPortrait(this.els.creaturePortrait, creature);
    this.els.energyFill.style.width = `${Math.min(100, Math.max(0, creature.energy / creature.maxEnergy * 100))}%`;
    this.els.personalityValue.textContent = creature.personality || 'Curioso';
    this.els.bondValue.textContent = `${Math.round((creature.bond || 0) * 100)}%`;
    this.els.knowledgeValue.textContent = creature.knowledge?.length ?? 0;
    this.els.moodValue.textContent = creature.mood || 'sereno';
    this.els.goalValue.textContent = creature.goal || 'explorar';
    this.els.autonomyValue.textContent = `${Math.round((creature.autonomy || .5) * this.simulation.autonomyLevel * 100)}%`;
    const socialProfile = this.simulation.civilization?.society?.getProfile(creature.id);
    const socialFaction = this.simulation.civilization?.society?.getFaction(socialProfile?.factionId);
    this.els.factionValue.textContent = socialFaction ? `${socialFaction.symbol} ${socialFaction.name}` : 'Sin afiliación';
    this.els.socialRankValue.textContent = socialProfile?.title || (socialFaction?.leaderId === creature.id ? 'Líder de facción' : 'Habitante');
    this.els.loyaltyValue.textContent = socialProfile ? `${Math.round(socialProfile.loyalty * 100)}%` : '—';
    const legacyProfile = this.simulation.legacy?.getProfile?.(creature.id);
    this.els.callingValue.textContent = legacyProfile?.calling || 'Sin vocación definida';
    this.els.lifeGoalValue.textContent = legacyProfile?.lifeGoal || 'Encontrar un propósito';
    this.els.hopeValue.textContent = legacyProfile ? `${Math.round(legacyProfile.hope * 100)}%` : '—';
    this.els.fearValue.textContent = legacyProfile ? `${Math.round(legacyProfile.fear * 100)}%` : '—';
    this.els.traumaValue.textContent = String(legacyProfile?.traumas?.length ?? 0);
    const skill = SKILLS[deriveSkill(creature)];
    this.els.creatureMeta.textContent += ` · ${skill ? `${skill.icon} ${skill.label}` : ''}`;
    this.els.geneList.replaceChildren(...Object.entries(GENE_LABELS).map(([key, label]) => {
      const article = document.createElement('article');
      const name = document.createElement('span');
      const value = document.createElement('b');
      name.textContent = label;
      const numeric = Number(creature.genome[key]);
      value.textContent = Number.isFinite(numeric) ? (key === 'vision' || key === 'longevity' ? numeric.toFixed(0) : numeric.toFixed(2)) : '—';
      article.append(name, value);
      return article;
    }));
    this.els.followBtn.textContent = this.renderer.followId === creature.id ? 'Dejar de seguir' : 'Seguir organismo';
    this.renderCognition(creature);
    this.maybeSpeakAutonomously(creature);
  }

  maybeSpeakAutonomously(creature) {
    if (!this.autoSpeak || !creature?.lastSpeech || creature.speechUntil <= this.simulation.time) return;
    const key = `${creature.id}:${creature.lastSpeech}`;
    if (key === this.lastAutoSpeechKey) return;
    this.lastAutoSpeechKey = key;
    this.speakText(creature.lastSpeech, creature);
  }

  interactWithSelected(text, speak = false) {
    const creature = this.selected;
    if (!creature) { this.toast('Selecciona una criatura para hablar con ella'); return; }
    try {
      const result = creature.teach(text, this.simulation);
      this.renderInspector();
      if (result.learned) this.toast(`${creature.name} ha incorporado un aprendizaje`);
      if (speak) this.speakText(result.response, creature);
    } catch (error) {
      console.error(error);
      this.toast('No se pudo procesar la enseñanza');
    }
  }

  renderCognition(creature) {
    const dialogue = Array.isArray(creature.dialogue) ? creature.dialogue.slice(-10) : [];
    if (!dialogue.length) {
      const placeholder = document.createElement('p');
      placeholder.className = 'cognition-placeholder';
      placeholder.textContent = `Habla con ${creature.name}. Puedes preguntar “¿qué sabes?” o enseñar “no ataques”, “busca alimento” y reglas SI… ENTONCES…`;
      this.els.cognitionLog.replaceChildren(placeholder);
    } else {
      this.els.cognitionLog.replaceChildren(...dialogue.map(item => {
        const message = document.createElement('div');
        message.className = `cognition-message ${item.role === 'user' ? 'user' : 'creature'}`;
        message.textContent = item.text;
        return message;
      }));
      this.els.cognitionLog.scrollTop = this.els.cognitionLog.scrollHeight;
    }

    const knowledge = Array.isArray(creature.knowledge) ? creature.knowledge.slice(-8).reverse() : [];
    if (!knowledge.length) {
      const empty = document.createElement('li');
      empty.className = 'knowledge-empty';
      empty.textContent = 'Aún no ha consolidado reglas ni hechos.';
      this.els.knowledgeList.replaceChildren(empty);
    } else {
      this.els.knowledgeList.replaceChildren(...knowledge.map(item => {
        const li = document.createElement('li');
        const label = document.createElement('span');
        const confidence = document.createElement('b');
        label.textContent = item.label;
        confidence.textContent = `${Math.round((Number(item.confidence) || 0) * 100)}%`;
        li.append(label, confidence);
        return li;
      }));
    }
  }

  updateSpeechSupport() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const synthesis = 'speechSynthesis' in window;
    this.els.listenBtn.disabled = !Recognition;
    this.els.speakBtn.disabled = !synthesis;
    this.els.speechSupport.textContent = Recognition && synthesis ? 'VOZ ACTIVA' : synthesis ? 'VOZ · SIN ESCUCHA' : 'SOLO TEXTO';
    if (!Recognition) this.els.listenBtn.title = 'El reconocimiento de voz no está disponible en este navegador';
  }

  startListening() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!this.selected) { this.toast('Selecciona primero una criatura'); return; }
    if (!Recognition) { this.toast('Este navegador no ofrece reconocimiento de voz. Puedes escribir la orden.'); return; }
    if (this.isListening) { try { this.recognition?.stop(); } catch { /* ya detenida */ } return; }

    const recognition = new Recognition();
    this.recognition = recognition;
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      this.isListening = true;
      this.els.listenBtn.textContent = '■ Detener escucha';
      this.els.speechSupport.textContent = 'ESCUCHANDO';
      this.els.speechSupport.classList.add('listening');
    };
    recognition.onresult = event => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) {
        this.els.teachInput.value = transcript;
        this.interactWithSelected(transcript, true);
        this.els.teachInput.value = '';
      }
    };
    recognition.onerror = event => {
      const message = event.error === 'not-allowed' ? 'Permiso de micrófono denegado' : `No se pudo escuchar: ${event.error || 'error desconocido'}`;
      this.toast(message);
    };
    recognition.onend = () => {
      this.isListening = false;
      this.els.listenBtn.textContent = '🎙 Escucharme';
      this.els.speechSupport.classList.remove('listening');
      this.updateSpeechSupport();
    };
    try { recognition.start(); } catch (error) { console.error(error); this.toast('El micrófono ya está ocupado'); }
  }

  speakText(text, creature) {
    if (!('speechSynthesis' in window) || !text) { this.toast('La voz no está disponible en este navegador'); return; }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text).slice(0, 420));
      utterance.lang = 'es-ES';
      const voices = window.speechSynthesis.getVoices();
      const spanish = voices.filter(voice => /^es(?:-|_)/i.test(voice.lang));
      const pool = spanish.length ? spanish : voices;
      if (pool.length) utterance.voice = pool[(creature?.voiceIndex || 0) % pool.length];
      utterance.rate = Math.max(.78, Math.min(1.28, .88 + (creature?.genome?.speed || 1) * .12));
      utterance.pitch = Math.max(.75, Math.min(1.55, 1.02 + (creature?.appearance?.eyeSize || 1) * .2 - (creature?.genome?.size || 4) * .025));
      utterance.volume = .92 * this.masterVolume;
      if (this.masterVolume <= 0) return;
      if (creature?.id) this.lastAutoSpeechKey = `${creature.id}:${String(text)}`;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error(error);
      this.toast('No se pudo reproducir la voz');
    }
  }

  activateTab(name) {
    const safeName = ['god', 'code', 'science', 'taller', 'collective', 'grandproject', 'civilization', 'legacy', 'archive'].includes(name) ? name : 'god';
    if (safeName === 'taller') this.renderObras();
    if (safeName === 'collective') this.renderCollective();
    if (safeName === 'grandproject') this.renderGrandProjects();
    if (safeName === 'civilization') this.renderCivilization();
    if (safeName === 'legacy') this.renderLegacy();
    if (safeName === 'archive') { this.renderSaves(); this.renderStats(); }
    document.querySelectorAll('.tab').forEach(button => {
      const active = button.dataset.tab === safeName;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    document.querySelectorAll('.tab-content').forEach(panel => {
      const active = panel.id === `tab-${safeName}`;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
    });
  }

  updatePause() {
    this.els.pauseBtn.textContent = this.simulation.paused ? '▶' : 'Ⅱ';
    this.els.pauseBtn.setAttribute('aria-label', this.simulation.paused ? 'Reanudar simulación' : 'Pausar simulación');
    this.els.runIndicator.classList.toggle('active', !this.simulation.paused);
    this.els.runLabel.textContent = this.simulation.paused ? 'SIMULACIÓN EN PAUSA' : 'SIMULACIÓN ACTIVA';
  }

  updateSpeedButtons() {
    document.querySelectorAll('.speed-btn').forEach(button => {
      const active = Number(button.dataset.speed) === this.simulation.speed;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  updateControlsFromSimulation() {
    this.els.mutationRange.value = this.simulation.environmentMutation;
    this.els.mutationOutput.textContent = `${this.simulation.environmentMutation.toFixed(1)}×`;
    this.els.foodRange.value = this.simulation.foodAbundance;
    this.els.foodOutput.textContent = `${this.simulation.foodAbundance.toFixed(1)}×`;
    this.updateEnvironmentControls();
    this.updateSpeedButtons();
    this.updatePause();
    this.updateCameraReadout();
  }

  updateEnvironmentControls() {
    const biome = this.simulation.getBiome();
    this.els.biomeSelect.value = this.simulation.biome;
    this.els.biomeQuickSelect.value = this.simulation.biome;
    this.els.autoBiomeToggle.checked = Boolean(this.simulation.autoBiome);
    this.els.autonomyRange.value = Math.round(this.simulation.autonomyLevel * 100);
    this.els.autonomyOutput.textContent = `${Math.round(this.simulation.autonomyLevel * 100)}%`;
    this.els.biomeDescription.textContent = biome.description;
    this.els.biomeIcon.textContent = biome.icon;
    this.els.biomeLabel.textContent = `BIOMA: ${biome.shortLabel}`;
  }

  updateMetrics(fps = 60) {
    const population = this.simulation.creatures.length;
    const delta = population - this.lastPopulation;
    this.lastPopulation = population;
    this.els.populationMetric.textContent = formatNumber(population);
    this.els.populationDelta.textContent = `${delta >= 0 ? '+' : ''}${delta} · ${this.simulation.eggs.length} huevos`;
    this.els.eggMetric.textContent = this.simulation.eggs.length;
    this.els.generationMetric.textContent = this.simulation.maxGeneration();
    this.els.diversityMetric.textContent = `${Math.round(this.simulation.diversity() * 100)}%`;
    this.els.worldClock.textContent = `Año ${this.simulation.year.toFixed(1)} · Ciclo ${Math.floor(this.simulation.year / 4) + 1}`;
    const temperatureState = Math.abs(this.simulation.temperature - 18) > 9 ? 'EXTREMO' : 'ESTABLE';
    this.els.climateLabel.textContent = `${this.simulation.temperature.toFixed(1)} °C · ${temperatureState}`;
    this.updateEnvironmentControls();
    this.updateCameraReadout();
    this.els.fpsMetric.textContent = `${Math.round(fps)} FPS`;
    const badge = this.els.healthBadge;
    const phase = this.simulation.genesis?.phase;
    badge.className = `badge ${phase === 'extinct' ? 'bad' : population > 1200 ? 'warn' : 'good'}`;
    badge.textContent = phase === 'dormant' ? 'ORIGEN' : phase === 'incubating' ? 'ECLOSIÓN' : phase === 'extinct' ? 'EXTINTO' : population > 780 ? 'SATURADO' : 'ESTABLE';
    this.updateGenesisPanel();
    if (!document.getElementById('tab-taller').hidden) this.renderObras();
    else {
      const pending = this.simulation.workshop?.obras.filter(obra => !obra.delivered).length ?? 0;
      this.els.obraBadge.hidden = pending === 0;
      this.els.obraBadge.textContent = pending;
    }
    const collectiveMetrics = this.simulation.getCollectiveMetrics();
    this.els.collectiveBadge.hidden = collectiveMetrics.queuedProjects === 0;
    this.els.collectiveBadge.textContent = collectiveMetrics.queuedProjects;
    if (!document.getElementById('tab-collective').hidden) this.renderCollective(collectiveMetrics);
    const grandMetrics = this.simulation.grandProjects.metrics();
    this.els.grandProjectBadge.hidden = grandMetrics.active === 0;
    this.els.grandProjectBadge.textContent = grandMetrics.active;
    if (!document.getElementById('tab-grandproject').hidden) this.renderGrandProjects();
    if (!document.getElementById('tab-civilization').hidden) this.renderCivilization();
    if (!document.getElementById('tab-legacy').hidden) this.renderLegacy();
    if (this.selectedId) this.renderInspector();
    if (Math.random() < .01 && !this.simulation.paused) recordStats(this.simulation).catch(() => {});
    this.drawChart();
  }

  updateGenesisPanel() {
    const status = this.simulation.getGenesisStatus();
    this.els.genesisPhase.textContent = status.label;
    this.els.genesisHint.textContent = status.hint;
    this.els.genesisProgressFill.style.width = `${Math.round(status.progress * 100)}%`;
    this.els.genesisIntro.hidden = this.simulation.genesis?.phase !== 'dormant';
  }

  drawChart() {
    const canvas = this.els.populationChart;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, devicePixelRatio || 1);
    if (!rect.width) return;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(110 * dpr);
    const context = canvas.getContext('2d');
    if (!context) return;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, rect.width, 110);
    const data = this.simulation.populationHistory;
    context.strokeStyle = 'rgba(255,255,255,.06)';
    context.lineWidth = 1;
    for (let y = 22; y < 110; y += 22) { context.beginPath(); context.moveTo(0, y); context.lineTo(rect.width, y); context.stroke(); }
    if (data.length < 2) {
      context.fillStyle = 'rgba(185,200,218,.55)';
      context.font = '11px system-ui, sans-serif';
      context.textAlign = 'center';
      context.fillText('Recopilando datos de población…', rect.width / 2, 58);
      return;
    }
    const max = Math.max(...data, 10);
    const min = Math.min(...data, 0);
    context.beginPath();
    data.forEach((value, index) => {
      const x = index / (data.length - 1) * rect.width;
      const y = 96 - (value - min) / Math.max(1, max - min) * 78;
      if (index) context.lineTo(x, y); else context.moveTo(x, y);
    });
    context.strokeStyle = '#62dcff';
    context.lineWidth = 2;
    context.stroke();
    context.lineTo(rect.width, 110);
    context.lineTo(0, 110);
    context.closePath();
    const gradient = context.createLinearGradient(0, 0, 0, 110);
    gradient.addColorStop(0, 'rgba(98,220,255,.24)');
    gradient.addColorStop(1, 'rgba(98,220,255,0)');
    context.fillStyle = gradient;
    context.fill();
  }

  renderTimeline() {
    const items = this.simulation.events.length ? this.simulation.events : [{ time: 'Sistema', text: 'Sin eventos registrados.' }];
    this.els.timeline.replaceChildren(...items.map(event => {
      const item = document.createElement('li');
      const time = document.createElement('b');
      const text = document.createElement('span');
      time.textContent = String(event.time ?? 'Registro');
      text.textContent = String(event.text ?? '');
      item.append(time, document.createElement('br'), text);
      return item;
    }));
  }

  async save(auto = false) {
    try {
      const snapshot = this.simulation.serialize();
      const result = await saveWorld(snapshot);
      if (!auto && result.backend === 'indexedDB') {
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        await saveWorld(snapshot, `snapshot-${stamp}`);
        await this.pruneSnapshots();
        await this.renderSaves();
      }
      const label = result.backend === 'localStorage' ? 'Copia local' : auto ? 'Autoguardado' : 'Instantánea guardada';
      this.els.saveState.textContent = `${label} · ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
      if (!auto) this.toast(result.backend === 'localStorage' ? 'Mundo guardado en almacenamiento alternativo' : 'Mundo e instantánea guardados en este dispositivo');
    } catch (error) {
      console.error(error);
      if (!auto) this.toast(error.message || 'No se pudo guardar el mundo');
    }
  }

  async pruneSnapshots() {
    const slots = (await listSlots()).filter(slot => slot.startsWith('snapshot-')).sort().reverse();
    await Promise.all(slots.slice(5).map(slot => deleteSlot(slot)));
  }

  async load() {
    try {
      const result = await loadWorld();
      if (!result.data) { this.toast('No hay ninguna instantánea guardada'); return; }
      this.simulation.hydrate(result.data);
      this.renderer.resetCamera();
      this.updateControlsFromSimulation();
      this.clearSelection();
      this.renderTimeline();
      this.updateMetrics(60);
      this.updateGenesisPanel();
      this.toast(`Mundo restaurado desde ${result.backend === 'indexedDB' ? 'IndexedDB' : 'copia local'}`);
    } catch (error) {
      console.error(error);
      this.toast(error.message || 'No se pudo cargar el mundo');
    }
  }

  async clearSave() {
    if (!confirm('¿Borrar la instantánea guardada en este dispositivo? El mundo actual seguirá abierto.')) return;
    await clearSavedWorld();
    this.els.saveState.textContent = 'Sin instantánea guardada';
    this.toast('Instantánea eliminada');
  }

  async importFile(file) {
    if (!file) return;
    try {
      if (file.size > CONFIG.MAX_IMPORT_BYTES) throw new Error('El archivo supera el límite de 15 MB');
      if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') throw new Error('Selecciona un archivo JSON');
      const data = JSON.parse(await file.text());
      const backup = this.simulation.creatures.length || this.simulation.eggs.length ? this.simulation.serialize() : null;
      try {
        this.simulation.hydrate(data);
      } catch (hydrateError) {
        if (backup) {
          try { this.simulation.hydrate(backup); } catch { /* El respaldo procede de serialize() y debería ser válido. */ }
        }
        throw hydrateError;
      }
      this.renderer.resetCamera();
      this.updateControlsFromSimulation();
      this.clearSelection();
      this.renderTimeline();
      this.updateMetrics(60);
      this.updateGenesisPanel();
      this.toast('Mundo importado correctamente');
    } catch (error) {
      console.error(error);
      this.toast(error.message || 'Archivo incompatible o dañado');
    } finally {
      this.els.importInput.value = '';
      this.els.quickImportInput.value = '';
    }
  }

  toggleCinema(force) {
    const enabled = typeof force === 'boolean' ? force : !document.body.classList.contains('cinema');
    document.body.classList.toggle('cinema', enabled);
    this.els.cinemaExitBtn.hidden = !enabled;
    setTimeout(() => this.renderer.resize(), 50);
  }

  downloadFile({ filename, mime, content }) {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  renderObras() {
    const workshop = this.simulation.workshop;
    if (!workshop) return;
    const teams = workshop.teams.filter(team => !team.dissolved);
    this.els.workshopStatus.textContent = teams.length
      ? teams.map(team => `Equipo de ${team.memberIds.length} preparando ${OBRA_META[team.type]?.label ?? 'una obra'} (${Math.round(Math.min(1, team.progress) * 100)}%)`).join(' · ')
      : 'Sin equipos activos por ahora.';
    const obras = [...workshop.obras].reverse();
    const pending = workshop.obras.filter(obra => !obra.delivered).length;
    this.els.obraBadge.hidden = pending === 0;
    this.els.obraBadge.textContent = pending;
    this.els.obraEmpty.hidden = obras.length > 0;
    this.els.deliverAllBtn.disabled = obras.length === 0;
    this.els.obraList.replaceChildren(...obras.map(obra => this.buildObraCard(obra)));
  }

  buildObraCard(obra) {
    const card = document.createElement('article');
    card.className = `obra-card${obra.delivered ? ' delivered' : ''}`;
    const head = document.createElement('header');
    const icon = document.createElement('span');
    icon.className = 'obra-icon';
    icon.textContent = OBRA_META[obra.type]?.icon ?? '❈';
    const title = document.createElement('h3');
    title.textContent = obra.title;
    head.append(icon, title);
    const meta = document.createElement('p');
    meta.className = 'obra-meta';
    meta.textContent = `Año ${obra.year} · ${obra.authors.map(author => `${author.code} (${author.skillLabel})`).join(', ')}`;
    card.append(head, meta);

    if (obra.payload.kind === 'svg') {
      const img = document.createElement('img');
      img.className = 'obra-preview';
      img.alt = `Vista previa de ${obra.title}`;
      img.loading = 'lazy';
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(obra.payload.data)}`;
      card.append(img);
    } else if (['text', 'csv', 'json'].includes(obra.payload.kind)) {
      const pre = document.createElement('pre');
      pre.className = 'obra-text';
      pre.textContent = String(obra.payload.data).split('\n').slice(0, obra.payload.kind === 'json' ? 10 : 7).join('\n');
      card.append(pre);
    } else if (obra.payload.kind === 'song') {
      const pre = document.createElement('pre');
      pre.className = 'obra-text';
      pre.textContent = (obra.payload.data.lyrics ?? []).join('\n');
      card.append(pre);
    } else if (obra.payload.kind === 'html') {
      const note = document.createElement('p');
      note.className = 'obra-meta';
      note.textContent = obra.type === 'codigo' ? 'Aplicación HTML autónoma, sin dependencias externas. Entrégala para abrir el código ejecutable.' : 'Documento HTML colectivo. Entrégalo para abrirlo.';
      card.append(note);
    }

    const actions = document.createElement('div');
    actions.className = 'obra-actions';
    if (obra.payload.kind === 'song') {
      const play = document.createElement('button');
      play.type = 'button';
      play.className = 'btn ghost';
      play.dataset.obra = obra.id;
      play.dataset.action = 'play';
      play.textContent = '♪ Escuchar';
      actions.append(play);
    }
    const deliver = document.createElement('button');
    deliver.type = 'button';
    deliver.className = 'btn primary';
    deliver.dataset.obra = obra.id;
    deliver.dataset.action = 'deliver';
    deliver.textContent = obra.delivered ? 'Entregar de nuevo' : 'Entregar obra';
    actions.append(deliver);
    card.append(actions);
    return card;
  }

  renderCollective(metrics = this.simulation.getCollectiveMetrics()) {
    this.els.collectiveIndex.textContent = String(metrics.index);
    this.els.collectiveKnowledge.textContent = String(metrics.uniqueKnowledge);
    this.els.collectiveRoles.textContent = String(metrics.roles);
    this.els.collectiveSynergy.textContent = `${Math.round(metrics.synergy * 100)}%`;
    this.els.collectiveQueue.textContent = String(metrics.queuedProjects);
    const atlas = this.simulation.collective;
    this.els.collectiveStatus.textContent = `${metrics.uniqueKnowledge} cápsulas únicas en ${metrics.domains} dominios. ${metrics.population} seres, ${metrics.roles} oficios, ${metrics.activeTeams} células trabajando y ${metrics.completedProjects} proyectos completados.`;
    const requests = this.simulation.workshop.requests || [];
    const teams = this.simulation.workshop.teams.filter(team => !team.dissolved && team.requestId);
    const cards = [];
    for (const team of teams) {
      const article = document.createElement('article');
      article.className = 'collective-project-card active';
      const title = document.createElement('b');
      title.textContent = `En desarrollo · ${OBRA_META[team.type]?.label || team.type}`;
      const copy = document.createElement('span');
      copy.textContent = `${team.prompt || 'Proyecto colectivo'} · ${team.memberIds.length} especialistas · ${Math.round(Math.min(1, team.progress) * 100)}%`;
      article.append(title, copy);
      cards.push(article);
    }
    for (const request of requests) {
      const article = document.createElement('article');
      article.className = 'collective-project-card';
      const title = document.createElement('b');
      title.textContent = `En cola · ${OBRA_META[request.type]?.label || request.type}`;
      const copy = document.createElement('span');
      copy.textContent = request.prompt;
      article.append(title, copy);
      cards.push(article);
    }
    if (!cards.length) {
      const empty = document.createElement('p');
      empty.className = 'panel-copy subtle';
      empty.textContent = atlas?.atlasLoaded
        ? 'La red está sincronizada. Escribe un encargo o deja que los equipos creen obras por iniciativa propia.'
        : 'El Atlas todavía no se ha sincronizado.';
      cards.push(empty);
    }
    this.els.collectiveProjectsList.replaceChildren(...cards);
  }

  renderGrandProjects() {
    const engine = this.simulation.grandProjects;
    const metrics = engine.metrics();
    this.els.grandProjectActiveCount.textContent = String(metrics.active);
    this.els.grandProjectCompletedCount.textContent = String(metrics.completed);
    this.els.grandProjectTasksCount.textContent = `${metrics.tasksDone}/${metrics.tasksTotal}`;
    this.els.grandProjectQuality.textContent = `${Math.round(metrics.averageQuality * 100)}%`;
    this.els.grandProjectExternalCount.textContent = String(metrics.externalInsights);
    this.els.grandProjectBadge.hidden = metrics.active === 0;
    this.els.grandProjectBadge.textContent = String(metrics.active);

    const projects = engine.projects;
    if (!projects.some(item => item.id === this.selectedGrandProjectId)) this.selectedGrandProjectId = projects[0]?.id || null;
    const statusNames = { active: 'Activo', waiting: 'En espera', paused: 'Pausado', completed: 'Completado', cancelled: 'Archivado' };
    const statusClass = status => status === 'completed' ? 'good' : status === 'cancelled' ? 'danger' : status === 'waiting' ? 'warn' : '';
    const cards = projects.map(project => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `grand-project-list-item${project.id === this.selectedGrandProjectId ? ' selected' : ''}`;
      button.dataset.grandProject = project.id;
      const icon = document.createElement('span'); icon.className = 'grand-project-list-icon'; icon.textContent = GRAND_PROJECT_TYPES[project.type]?.icon || 'Ω';
      const copy = document.createElement('span'); copy.className = 'grand-project-list-copy';
      const title = document.createElement('b'); title.textContent = project.title;
      const meta = document.createElement('small'); meta.textContent = `${statusNames[project.status] || project.status} · ${Math.round(project.progress * 100)}% · ${project.tasks.filter(item => item.status === 'completed').length}/${project.tasks.length} tareas`;
      const bar = document.createElement('span'); bar.className = 'mini-project-bar';
      const fill = document.createElement('i'); fill.style.width = `${Math.round(project.progress * 100)}%`; bar.append(fill);
      copy.append(title, meta, bar);
      button.append(icon, copy);
      return button;
    });
    if (!cards.length) {
      const empty = document.createElement('p'); empty.className = 'panel-copy subtle'; empty.textContent = 'Todavía no existe ningún Gran Proyecto.';
      cards.push(empty);
    }
    this.els.grandProjectList.replaceChildren(...cards);

    const project = engine.find(this.selectedGrandProjectId);
    this.els.grandProjectEmpty.hidden = Boolean(project);
    this.els.grandProjectDetail.hidden = !project;
    if (!project) return;
    const meta = GRAND_PROJECT_TYPES[project.type] || GRAND_PROJECT_TYPES.custom;
    this.els.grandProjectDetailType.textContent = `${meta.icon} ${meta.label} · PROYECTO ${project.number}`;
    this.els.grandProjectDetailTitle.textContent = project.title;
    this.els.grandProjectDetailBrief.textContent = project.brief;
    this.els.grandProjectStatus.textContent = statusNames[project.status] || project.status;
    this.els.grandProjectStatus.className = `badge ${statusClass(project.status)}`.trim();
    this.els.grandProjectProgressLabel.textContent = `${Math.round(project.progress * 100)}%`;
    this.els.grandProjectProgressFill.style.width = `${Math.round(project.progress * 100)}%`;
    this.els.grandProjectLastEvent.textContent = project.lastEvent || 'Sin actividad reciente.';
    this.els.grandProjectPauseBtn.textContent = project.status === 'paused' ? 'Reanudar' : 'Pausar';
    this.els.grandProjectPauseBtn.disabled = ['completed','cancelled','waiting'].includes(project.status);
    this.els.grandProjectCancelBtn.disabled = ['completed','cancelled'].includes(project.status);

    const phaseNames = { definition: 'Definición', planning: 'Planificación', research: 'Investigación', design: 'Diseño', production: 'Producción', verification: 'Verificación', delivery: 'Entrega' };
    const taskNodes = project.tasks.map(task => {
      const item = document.createElement('article');
      item.className = `grand-project-task ${task.status}`;
      const head = document.createElement('div');
      const title = document.createElement('b'); title.textContent = task.title;
      const percent = document.createElement('span'); percent.textContent = `${Math.round(task.progress * 100)}%`;
      head.append(title, percent);
      const phase = document.createElement('small');
      const crew = task.assignedIds.map(id => this.simulation.creatures.find(creature => creature?.id === id)?.entityCode).filter(Boolean).slice(0, 6);
      phase.textContent = `${phaseNames[task.phase] || task.phase} · ${task.status === 'completed' ? 'terminada' : task.status === 'working' ? 'en ejecución' : 'pendiente'}${crew.length ? ` · ${crew.join(', ')}` : ''}`;
      const bar = document.createElement('div'); bar.className = 'grand-project-task-bar'; const fill = document.createElement('span'); fill.style.width = `${Math.round(task.progress * 100)}%`; bar.append(fill);
      item.append(head, phase, bar);
      if (task.output) { const output = document.createElement('p'); output.textContent = task.output; item.append(output); }
      return item;
    });
    this.els.grandProjectTaskList.replaceChildren(...taskNodes);

    const learningNodes = [];
    for (const blocker of project.blockers) {
      const item = document.createElement('article'); item.className = 'grand-project-note blocker';
      const title = document.createElement('b'); title.textContent = 'Bloqueo activo';
      const text = document.createElement('span'); text.textContent = blocker.text;
      item.append(title, text); learningNodes.push(item);
    }
    for (const lesson of project.lessons.slice(0, 8)) {
      const item = document.createElement('article'); item.className = 'grand-project-note lesson';
      const title = document.createElement('b'); title.textContent = `Aprendizaje · año ${Number(lesson.year).toFixed(1)}`;
      const text = document.createElement('span'); text.textContent = lesson.text;
      item.append(title, text); learningNodes.push(item);
    }
    for (const insight of project.externalInsights.slice(0, 5)) {
      const item = document.createElement('article'); item.className = 'grand-project-note external';
      const title = document.createElement('b'); title.textContent = 'Fuente externa revisada';
      const text = document.createElement('span'); text.textContent = insight.text;
      item.append(title, text); learningNodes.push(item);
    }
    if (!learningNodes.length) {
      const empty = document.createElement('p'); empty.className = 'panel-copy subtle'; empty.textContent = 'No hay bloqueos ni fallos registrados. Cuando el equipo se equivoque, la corrección aparecerá aquí.'; learningNodes.push(empty);
    }
    this.els.grandProjectLearningList.replaceChildren(...learningNodes);
  }

  renderCivilization() {
    const civilization = this.simulation.civilization;
    if (!civilization) return;
    const metrics = civilization.getMetrics(this.simulation);
    this.els.civilizationEra.textContent = metrics.era.label;
    this.els.civilizationEraCopy.textContent = metrics.era.description;
    this.els.civilizationTechCount.textContent = String(metrics.technologies);
    this.els.civilizationInstitutionCount.textContent = String(metrics.institutions);
    this.els.civilizationWords.textContent = String(metrics.words);
    this.els.civilizationProsperity.textContent = `${Math.round(metrics.prosperity * 100)}%`;
    this.els.civilizationCooperation.textContent = `${Math.round(metrics.cooperation * 100)}%`;
    this.els.civilizationStability.textContent = `${Math.round(metrics.stability * 100)}%`;
    const society = civilization.society;
    const societyMetrics = society.getMetrics();
    this.els.societyFactionCount.textContent = String(societyMetrics.factions);
    this.els.societyTreatyCount.textContent = String(societyMetrics.treaties);
    this.els.societyWarCount.textContent = String(societyMetrics.activeWars);
    this.els.societyGovernment.textContent = societyMetrics.government.label;
    this.els.societyRuler.textContent = societyMetrics.ruler ? `${society.government.title} · ${societyMetrics.ruler.name}` : 'Sin designar';
    this.els.societyLegitimacy.textContent = `${Math.round(societyMetrics.legitimacy * 100)}%`;
    this.els.societySuccession.textContent = `Sucesión: ${society.government.succession}`;
    this.els.societyUnrest.textContent = `${Math.round(societyMetrics.unrest * 100)}% tensión`;
    this.els.societyBetrayals.textContent = `${societyMetrics.betrayals} traiciones`;
    this.els.civilizationLanguageName.textContent = civilization.language.name;
    this.els.civilizationGrammar.textContent = `NIVEL ${civilization.language.grammarLevel.toFixed(1)}`;

    const unlocked = civilization.getUnlockedTechnologies();
    const next = TECHNOLOGY_TREE.find(definition => !civilization.technologies.includes(definition.key) && definition.requires.every(key => civilization.technologies.includes(key)));
    if (next) {
      const available = civilization.researchPoints + civilization.innovationPoints;
      this.els.civilizationNextTech.textContent = `Siguiente posibilidad: ${next.label}. Requiere ${next.minPopulation} seres, ${next.minKnowledge} conocimientos, ${next.minProjects} proyectos y ${next.cost} puntos de investigación/innovación. Progreso actual: ${Math.floor(available)}/${next.cost}.`;
    } else {
      this.els.civilizationNextTech.textContent = unlocked.length === TECHNOLOGY_TREE.length
        ? 'La civilización ha completado todo el árbol tecnológico disponible.'
        : 'La siguiente rama depende de tecnologías previas todavía no consolidadas.';
    }
    this.els.civilizationTechList.replaceChildren(...(unlocked.length ? unlocked.slice().reverse().map(item => {
      const card = document.createElement('article');
      const title = document.createElement('b'); title.textContent = item.label;
      const copy = document.createElement('span'); copy.textContent = item.description;
      card.append(title, copy); return card;
    }) : [this.buildCivilizationEmpty('Aún no hay tecnologías. La supervivencia y la memoria oral serán el primer paso.') ]));

    this.els.civilizationInstitutionList.replaceChildren(...(civilization.institutions.length ? civilization.institutions.slice().reverse().map(item => {
      const card = document.createElement('article');
      const title = document.createElement('b'); title.textContent = item.label;
      const copy = document.createElement('span'); copy.textContent = `${item.description} Fundada en el año ${Number(item.foundedYear).toFixed(1)}.`;
      card.append(title, copy); return card;
    }) : [this.buildCivilizationEmpty('Las instituciones aparecerán cuando la población y el conocimiento necesiten organizarse.') ]));

    const culturalCards = [];
    for (const item of civilization.culture.values.slice().reverse()) {
      const card = document.createElement('article');
      const title = document.createElement('b'); title.textContent = item.label;
      const copy = document.createElement('span'); copy.textContent = item.statement;
      card.append(title, copy); culturalCards.push(card);
    }
    for (const tradition of civilization.culture.traditions.slice(-5).reverse()) {
      const card = document.createElement('article');
      const title = document.createElement('b'); title.textContent = 'Tradición';
      const copy = document.createElement('span'); copy.textContent = tradition;
      card.append(title, copy); culturalCards.push(card);
    }
    if (civilization.culture.symbols.length) {
      const card = document.createElement('article');
      const title = document.createElement('b'); title.textContent = 'Símbolos';
      const copy = document.createElement('span'); copy.textContent = civilization.culture.symbols.join('  ');
      card.append(title, copy); culturalCards.push(card);
    }
    this.els.civilizationCultureList.replaceChildren(...(culturalCards.length ? culturalCards : [this.buildCivilizationEmpty('La cultura comenzará con los primeros valores, palabras y rituales compartidos.') ]));

    const lexicon = civilization.language.lexicon.slice(-16).reverse();
    this.els.civilizationLexicon.replaceChildren(...(lexicon.length ? lexicon.map(item => {
      const card = document.createElement('article');
      const word = document.createElement('b'); word.textContent = item.word;
      const concept = document.createElement('span'); concept.textContent = item.concept;
      const meaning = document.createElement('small'); meaning.textContent = item.meaning;
      card.append(word, concept, meaning); return card;
    }) : [this.buildCivilizationEmpty('El idioma nacerá cuando dos o más seres necesiten compartir conceptos.') ]));

    const laws = society.government.laws.slice().reverse();
    this.els.societyLawList.replaceChildren(...(laws.length ? laws.map(law => {
      const card = document.createElement('article');
      const title = document.createElement('b'); title.textContent = law.label;
      const copy = document.createElement('span'); copy.textContent = `${law.text} Año ${Number(law.enactedYear).toFixed(1)}.`;
      card.append(title, copy); return card;
    }) : [this.buildCivilizationEmpty('Todavía no hay leyes. Aparecerán cuando el gobierno necesite convertir valores en normas.') ]));

    const activeFactions = society.factions.filter(faction => faction.status === 'active').sort((a, b) => b.power - a.power);
    this.els.societyFactionList.replaceChildren(...(activeFactions.length ? activeFactions.map(faction => {
      const item = document.createElement('article'); item.className = 'faction-item';
      const symbol = document.createElement('span'); symbol.className = 'faction-symbol'; symbol.textContent = faction.symbol;
      const copy = document.createElement('div'); copy.className = 'faction-copy';
      const title = document.createElement('b'); title.textContent = faction.name;
      const leader = society.getProfile(faction.leaderId);
      const motto = document.createElement('span'); motto.textContent = faction.motto;
      const meta = document.createElement('small'); meta.textContent = `${faction.memberIds.length} miembros · líder: ${leader?.name || 'sin designar'} · cohesión ${Math.round(faction.cohesion * 100)}%`;
      copy.append(title, motto, meta);
      const power = document.createElement('div'); power.className = 'faction-power';
      const number = document.createElement('b'); number.textContent = String(Math.round(faction.power));
      const label = document.createElement('small'); label.textContent = 'poder';
      power.append(number, label); item.append(symbol, copy, power); return item;
    }) : [this.buildCivilizationEmpty('Las primeras facciones surgirán cuando al menos seis seres desarrollen afinidades distintas.') ]));

    const diplomacyCards = [];
    for (const war of society.wars.filter(item => item.status === 'active').slice().reverse()) {
      const attacker = society.getFaction(war.attackerId); const defender = society.getFaction(war.defenderId);
      const card = document.createElement('article'); card.className = 'diplomacy-war';
      const title = document.createElement('b'); title.textContent = `⚔ ${war.name}`;
      const copy = document.createElement('span'); copy.textContent = `${attacker?.name || 'Facción'} contra ${defender?.name || 'Facción'} · intensidad ${Math.round(war.intensity * 100)}% · ${war.casualties.wounded} heridos, ${war.casualties.dead} muertos.`;
      card.append(title, copy); diplomacyCards.push(card);
    }
    for (const treaty of society.treaties.filter(item => item.status === 'active').slice(-8).reverse()) {
      const first = society.getFaction(treaty.parties[0]); const second = society.getFaction(treaty.parties[1]);
      const card = document.createElement('article'); card.className = 'diplomacy-treaty';
      const title = document.createElement('b'); title.textContent = treaty.type === 'alliance' ? '✦ Alianza defensiva' : treaty.type === 'trade' ? '⇄ Pacto de intercambio' : '☮ Tratado de paz';
      const copy = document.createElement('span'); copy.textContent = `${first?.name || 'Facción'} + ${second?.name || 'Facción'} · vigente desde el año ${Number(treaty.startedYear).toFixed(1)}.`;
      card.append(title, copy); diplomacyCards.push(card);
    }
    this.els.societyDiplomacyList.replaceChildren(...(diplomacyCards.length ? diplomacyCards : [this.buildCivilizationEmpty('Todavía no existen tratados ni guerras. Las relaciones cambiarán con los recursos, las ideologías y sus líderes.') ]));

    const sagas = society.sagas.slice(0, 12);
    this.els.societySagaList.replaceChildren(...(sagas.length ? sagas.map(saga => {
      const item = document.createElement('article'); item.className = 'saga-item';
      const header = document.createElement('header');
      const title = document.createElement('b'); title.textContent = saga.title;
      const time = document.createElement('time'); time.textContent = `Año ${Number(saga.year).toFixed(1)}`;
      header.append(title, time);
      const summary = document.createElement('span'); summary.textContent = saga.summary;
      const status = document.createElement('small'); status.textContent = `${saga.type} · ${saga.status === 'active' ? 'en curso' : saga.status === 'legend' ? 'convertida en leyenda' : 'concluida'}${saga.chapters.length ? ` · ${saga.chapters.length} capítulos` : ''}`;
      item.append(header, summary, status); return item;
    }) : [this.buildCivilizationEmpty('Las sagas aparecerán con fundaciones, reinados, alianzas, golpes, deserciones y guerras.') ]));

    const chronicle = civilization.chronicle.slice(0, 50);
    this.els.civilizationChronicle.replaceChildren(...(chronicle.length ? chronicle.map(item => {
      const row = document.createElement('li');
      const time = document.createElement('time'); time.textContent = `Año ${Number(item.year).toFixed(1)}`;
      const type = document.createElement('b'); type.textContent = item.type || 'registro';
      const copy = document.createElement('span'); copy.textContent = item.text;
      row.append(time, type, copy); return row;
    }) : [this.buildChronicleEmpty()]));
  }

  renderLegacy() {
    const legacy = this.simulation.legacy;
    if (!legacy) return;
    const metrics = legacy.getMetrics();
    this.els.legacyDreamCount.textContent = String(metrics.dreams);
    this.els.legacyBookCount.textContent = String(metrics.books);
    this.els.legacyRuinCount.textContent = String(metrics.ruins);
    this.els.legacyMythCount.textContent = String(metrics.myths);
    this.els.legacyLibraryCount.textContent = String(metrics.libraries);
    this.els.legacyInsightCount.textContent = String(metrics.insights);
    this.els.legacyPhase.textContent = `${String(metrics.environment.phase || 'día').toUpperCase()} · ${String(metrics.environment.season || 'Brote').toUpperCase()}`;
    this.els.legacyWeather.textContent = metrics.environment.weatherLabel || 'Cielo quieto';

    const empty = text => {
      const node = document.createElement('p');
      node.className = 'panel-copy subtle legacy-empty';
      node.textContent = text;
      return node;
    };
    const makeItem = ({ title, text, meta = '', className = '' }) => {
      const item = document.createElement('article');
      item.className = `legacy-item ${className}`.trim();
      const heading = document.createElement('b'); heading.textContent = title;
      const copy = document.createElement('span'); copy.textContent = text;
      item.append(heading, copy);
      if (meta) { const small = document.createElement('small'); small.textContent = meta; item.append(small); }
      return item;
    };

    const dreams = legacy.dreams.slice(0, 10);
    this.els.legacyDreamList.replaceChildren(...(dreams.length ? dreams.map(dream => makeItem({
      title: `${dream.omen ? '✦ Presagio' : 'Sueño'} de ${dream.creatureName}`,
      text: dream.text,
      meta: `Año ${Number(dream.year).toFixed(1)} · ${dream.remembered ? 'recordado' : 'fragmentario'}`,
      className: dream.omen ? 'omen' : ''
    })) : [empty('Los sueños aparecerán cuando los seres descansen, envejezcan o atraviesen momentos de debilidad.') ]));

    const rumors = legacy.rumors.filter(item => item.status !== 'olvidado').slice(0, 10);
    this.els.legacyRumorList.replaceChildren(...(rumors.length ? rumors.map(rumor => makeItem({
      title: `${rumor.status === 'leyenda popular' ? '◈ Leyenda popular' : 'Rumor'} · ${rumor.originName}`,
      text: rumor.claim,
      meta: `${rumor.spread || rumor.believers?.length || 1} creyentes · distorsión ${Math.round((rumor.distorted || 0) * 100)}%`
    })) : [empty('Todavía no circulan rumores. Necesitan varias criaturas, relaciones y hechos ambiguos que interpretar.') ]));

    const books = legacy.books.slice(0, 10);
    const libraries = legacy.libraries.slice(0, 4);
    const bookNodes = books.map(book => makeItem({
      title: `▤ ${book.title}`,
      text: book.excerpt,
      meta: `${book.authorName} · año ${Number(book.year).toFixed(1)} · ${book.type}`
    }));
    for (const library of libraries) bookNodes.push(makeItem({
      title: `⌂ ${library.name}`,
      text: `Custodia ${library.bookIds?.length || 0} obras bajo la responsabilidad de ${library.custodianName}.`,
      meta: `Fundada en el año ${Number(library.foundedYear).toFixed(1)} · estado ${Math.round((library.condition || 0) * 100)}%`,
      className: 'library'
    }));
    this.els.legacyBookList.replaceChildren(...(bookNodes.length ? bookNodes : [empty('La escritura surgirá cuando exista alfabetización, memoria y una criatura adulta con algo que transmitir.') ]));

    const ruins = legacy.ruins.slice(0, 8);
    const relicById = new Map(legacy.relics.map(item => [item.id, item]));
    this.els.legacyRuinList.replaceChildren(...(ruins.length ? ruins.map(ruin => {
      const relicNames = (ruin.relicIds || []).map(id => relicById.get(id)?.name).filter(Boolean);
      return makeItem({
        title: `▥ ${ruin.name}`,
        text: `${ruin.description}${relicNames.length ? ` Reliquias: ${relicNames.join(', ')}.` : ''}`,
        meta: `X ${Math.round(ruin.x)}, Y ${Math.round(ruin.y)} · antigüedad ${Number(ruin.age || 0).toFixed(1)} años · estado ${Math.round((ruin.condition || 0) * 100)}%`,
        className: 'ruin'
      });
    }) : [empty('Las ruinas aparecerán cuando mueran fundadores, líderes, autores o criaturas cuyo legado sea importante.') ]));

    const insights = legacy.collectiveInsights.slice(0, 10);
    this.els.legacyInsightList.replaceChildren(...(insights.length ? insights.map(insight => makeItem({
      title: `✦ ${insight.title}`,
      text: insight.text,
      meta: `${insight.memberNames?.join(', ') || 'Equipo Ω'} · ${insight.skills?.join(' + ') || 'oficios combinados'}`,
      className: 'insight'
    })) : [empty('Las síntesis aparecen cuando al menos tres oficios distintos reúnen suficiente conocimiento y cooperación.') ]));

    const legacies = legacy.legacies.slice(0, 10);
    const myths = legacy.myths.slice(0, 5);
    const nodes = legacies.map(record => makeItem({
      title: `${record.entityCode || 'Ω'} · ${record.name}`,
      text: record.summary,
      meta: `Año ${Number(record.year).toFixed(1)} · renombre ${Math.round((record.renown || 0) * 100)}%`,
      className: 'memorial'
    }));
    for (const myth of myths) nodes.push(makeItem({
      title: `✧ ${myth.title}`,
      text: myth.text,
      meta: `Mito nacido en el año ${Number(myth.year).toFixed(1)}`,
      className: 'myth'
    }));
    this.els.legacyLegaciesList.replaceChildren(...(nodes.length ? nodes : [empty('Aquí quedará constancia de quienes dejaron libros, títulos, descubrimientos, descendientes, reliquias o heridas en los demás.') ]));
  }

  buildCivilizationEmpty(text) {
    const item = document.createElement('p');
    item.className = 'panel-copy subtle civilization-empty';
    item.textContent = text;
    return item;
  }

  buildChronicleEmpty() {
    const item = document.createElement('li');
    const time = document.createElement('time'); time.textContent = 'Año 0.0';
    const type = document.createElement('b'); type.textContent = 'origen';
    const copy = document.createElement('span'); copy.textContent = 'La crónica comenzará cuando Ω-001 despierte.';
    item.append(time, type, copy);
    return item;
  }

  async renderSaves() {
    const slots = await listSlots();
    this.els.savesList.replaceChildren(...slots.slice(0, 5).map(slot => {
      const card = document.createElement('article');
      card.className = 'save-card';
      const h = document.createElement('h4');
      h.textContent = formatSlotName(slot);
      card.append(h);
      const actions = document.createElement('div');
      actions.className = 'save-actions';
      const load = document.createElement('button');
      load.type = 'button'; load.className = 'btn ghost'; load.textContent = 'Cargar';
      load.addEventListener('click', () => {
        if (confirm('¿Cargar este mundo?')) {
          loadWorld(slot).then(result => {
            if (!result.data) return;
            this.simulation.hydrate(result.data);
            this.renderer.resetCamera();
            this.updateControlsFromSimulation();
            this.clearSelection();
            this.renderTimeline();
            this.updateMetrics(60);
            this.updateGenesisPanel();
            this.toast(`Cargado: ${formatSlotName(slot)}`);
          }).catch(error => {
            console.error(error);
            this.toast('No se pudo cargar la instantánea');
          });
        }
      });
      const del = document.createElement('button');
      del.type = 'button'; del.className = 'btn danger'; del.textContent = 'Borrar';
      del.addEventListener('click', () => {
        if (confirm('¿Borrar definitivamente?')) {
          deleteSlot(slot).then(() => { this.toast(`Borrado: ${slot}`); this.renderSaves(); });
        }
      });
      actions.append(load, del);
      card.append(actions);
      return card;
    }));
    this.els.downloadAllSavesBtn.disabled = slots.length === 0;
  }

  async renderStats() {
    const stats = await getStats();
    if (!stats) {
      this.els.statsPanel.textContent = 'Las estadísticas históricas aparecerán cuando el ecosistema haya avanzado.';
      return;
    }
    const values = [
      ['Población registrada', stats.maxPopulation],
      ['Generación máxima', stats.maxGeneration],
      ['Obras culturales', stats.totalWorks],
      ['Nacimientos', stats.totalBirths],
      ['Muertes', stats.totalDeaths],
      ['Año de sesión', Number(stats.sessionYear || 0).toFixed(1)]
    ];
    this.els.statsPanel.replaceChildren(...values.map(([label, value]) => {
      const item = document.createElement('span');
      item.className = 'stat';
      const name = document.createElement('span');
      name.className = 'stat-label';
      name.textContent = label;
      const number = document.createElement('strong');
      number.className = 'stat-value';
      number.textContent = String(value ?? 0);
      item.append(name, number);
      return item;
    }));
  }

  async downloadAllSaves() {
    const slots = await listSlots();
    if (!slots.length) return;
    const content = [];
    for (const slot of slots) {
      const result = await loadWorld(slot);
      if (result.data) content.push({ slot, data: result.data });
    }
    const json = JSON.stringify({ backup: content, backupDate: new Date().toISOString() }, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `Genesis-Backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.toast('Copia de seguridad descargada');
  }

  playSong(obra, button) {
    try {
      const song = obra.payload.data;
      if (!song?.notes?.length) return;
      if (this.masterVolume <= 0) { this.toast('El volumen está silenciado'); return; }
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) { this.toast('Audio no disponible en este navegador'); return; }
      this.audioContext = this.audioContext || new AudioContextClass();
      const ctx = this.audioContext;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const beat = 60 / (song.tempo || 96);
      const master = ctx.createGain();
      master.gain.value = .2 * this.masterVolume;
      master.connect(ctx.destination);
      let lastEnd = 0;
      for (const note of song.notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = 440 * Math.pow(2, (note.midi - 69) / 12);
        const start = ctx.currentTime + .05 + note.t * beat * 4;
        const stop = start + note.dur * beat * 4;
        lastEnd = Math.max(lastEnd, stop);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(.9, start + .02);
        gain.gain.exponentialRampToValueAtTime(.001, stop);
        osc.connect(gain);
        gain.connect(master);
        osc.start(start);
        osc.stop(stop + .05);
      }
      button.disabled = true;
      window.setTimeout(() => { button.disabled = false; }, Math.max(500, (lastEnd - ctx.currentTime) * 1000 + 300));
    } catch (error) {
      console.warn('No se pudo reproducir el himno', error);
      this.toast('No se pudo reproducir el himno');
    }
  }

  toast(text) {
    clearTimeout(this.toastTimer);
    this.els.toast.textContent = String(text);
    this.els.toast.classList.add('show');
    this.toastTimer = setTimeout(() => this.els.toast.classList.remove('show'), 2600);
  }
}

function collectRequiredElements() {
  const elements = Object.fromEntries([...document.querySelectorAll('[id]')].map(element => [element.id, element]));
  const required = [
    'worldCanvas', 'genesisIntro', 'startGenesisBtn', 'genesisProgress', 'genesisPhase', 'genesisProgressFill', 'genesisHint', 'pauseBtn', 'cinemaBtn', 'cinemaExitBtn', 'cameraResetBtn', 'cameraZoomOutBtn', 'cameraZoomInBtn', 'cameraZoomLabel', 'helpBtn', 'helpDialog',
    'mutationRange', 'mutationOutput', 'foodRange', 'foodOutput', 'biomeSelect', 'biomeQuickSelect', 'biomeDescription', 'biomeIcon', 'biomeLabel', 'autoBiomeToggle', 'autonomyRange', 'autonomyOutput', 'pulseBtn', 'resetBtn',
    'profileSelect', 'progSpeed', 'progSpeedOut', 'progVision', 'progVisionOut', 'progSocial', 'progSocialOut',
    'progCuriosity', 'progCuriosityOut', 'progAggression', 'progAggressionOut', 'progEfficiency', 'progEfficiencyOut',
    'programName', 'programNote', 'programOrb', 'armLineageBtn', 'followBtn', 'saveBtn', 'quickSaveBtn', 'loadBtn', 'quickLoadBtn', 'clearSaveBtn',
    'exportBtn', 'quickExportBtn', 'importInput', 'quickImportInput', 'openCollectiveBtn', 'openGrandProjectBtn', 'openLegacyBtn', 'openArchiveBtn', 'selectionEmpty', 'creatureInspector', 'creatureName', 'creatureMeta', 'creaturePortrait',
    'energyFill', 'geneList', 'personalityValue', 'bondValue', 'knowledgeValue', 'moodValue', 'goalValue', 'autonomyValue', 'factionValue', 'socialRankValue', 'loyaltyValue', 'callingValue', 'lifeGoalValue', 'hopeValue', 'fearValue', 'traumaValue', 'speechSupport', 'cognitionLog',
    'teachForm', 'teachInput', 'teachBtn', 'listenBtn', 'speakBtn', 'autoSpeakToggle', 'volumeSlider', 'volumeLabel', 'qualitySelect', 'knowledgeList', 'populationMetric', 'populationDelta', 'eggMetric', 'generationMetric', 'diversityMetric',
    'worldClock', 'climateLabel', 'fpsMetric', 'healthBadge', 'populationChart', 'timeline', 'toast', 'saveState',
    'installBtn', 'updateBtn', 'runIndicator', 'runLabel', 'activeToolLabel', 'toolHint',
    'workshopStatus', 'obraList', 'obraEmpty', 'deliverAllBtn', 'obraBadge', 'collectiveBadge', 'collectiveIndex', 'collectiveKnowledge', 'collectiveRoles', 'collectiveSynergy', 'collectiveQueue', 'collectiveStatus', 'injectAtlasBtn', 'collectiveProjectType', 'collectivePrompt', 'collectiveProjectBtn', 'collectiveProjectsList',
    'grandProjectBadge', 'grandProjectActiveCount', 'grandProjectCompletedCount', 'grandProjectTasksCount', 'grandProjectQuality', 'grandProjectExternalCount', 'grandProjectType', 'grandProjectTitle', 'grandProjectBrief', 'grandProjectConstraints', 'grandProjectCreateBtn', 'grandProjectList', 'grandProjectEmpty', 'grandProjectDetail', 'grandProjectDetailType', 'grandProjectDetailTitle', 'grandProjectDetailBrief', 'grandProjectStatus', 'grandProjectProgressLabel', 'grandProjectProgressFill', 'grandProjectLastEvent', 'grandProjectPauseBtn', 'grandProjectDossierBtn', 'grandProjectContextBtn', 'grandProjectCancelBtn', 'grandProjectTaskList', 'grandProjectLearningList', 'grandProjectExternalInput', 'grandProjectIntegrateBtn',
    'openCivilizationBtn', 'civilizationEra', 'civilizationEraCopy', 'civilizationTechCount', 'civilizationInstitutionCount', 'civilizationWords', 'civilizationProsperity', 'civilizationCooperation', 'civilizationStability', 'civilizationNextTech', 'civilizationTechList', 'civilizationInstitutionList', 'civilizationCultureList', 'civilizationLanguageName', 'civilizationGrammar', 'civilizationLexicon', 'oracleQuestion', 'exportOracleBtn', 'oracleResponse', 'integrateOracleBtn', 'oracleStatus', 'civilizationChronicle', 'societyFactionCount', 'societyTreatyCount', 'societyWarCount', 'societyGovernment', 'societyRuler', 'societyLegitimacy', 'societySuccession', 'societyLawList', 'societyUnrest', 'societyFactionList', 'societyDiplomacyList', 'societyBetrayals', 'societySagaList',
    'legacyPhase', 'legacyWeather', 'legacyDreamCount', 'legacyBookCount', 'legacyRuinCount', 'legacyMythCount', 'legacyLibraryCount', 'legacyInsightCount', 'legacyDreamList', 'legacyRumorList', 'legacyBookList', 'legacyRuinList', 'legacyInsightList', 'legacyLegaciesList',
    'savesList', 'downloadAllSavesBtn', 'statsPanel'
  ];
  const missing = required.filter(id => !elements[id]);
  if (missing.length) throw new Error(`Interfaz incompleta: faltan ${missing.join(', ')}`);
  return elements;
}

function safeFilename(value) {
  return String(value || 'Gran-Proyecto-Omega').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'Gran-Proyecto-Omega';
}

function formatSlotName(slot) {
  if (slot === 'latest') return 'Último autoguardado';
  if (!slot.startsWith('snapshot-')) return slot;
  const raw = slot.slice(9).replace(/-(\d{2})-(\d{2})-(\d{3})Z$/, ':$1:$2.$3Z');
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? slot : `Instantánea · ${date.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'medium' })}`;
}

function readBooleanSetting(key, fallback = false) {
  try {
    const value = localStorage.getItem(key);
    return value == null ? fallback : value === 'true';
  } catch {
    return fallback;
  }
}

function writeBooleanSetting(key, value) {
  try { localStorage.setItem(key, String(Boolean(value))); } catch { /* Almacenamiento no disponible. */ }
}

function readNumberSetting(key, fallback, min, max) {
  try {
    const value = Number(localStorage.getItem(key));
    if (!Number.isFinite(value)) return fallback;
    return Math.min(max, Math.max(min, value));
  } catch {
    return fallback;
  }
}

function writeNumberSetting(key, value) {
  try { localStorage.setItem(key, String(value)); } catch { /* Almacenamiento no disponible. */ }
}

function readStringSetting(key, fallback, allowed) {
  try {
    const value = localStorage.getItem(key);
    return allowed.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function writeStringSetting(key, value) {
  try { localStorage.setItem(key, String(value)); } catch { /* Almacenamiento no disponible. */ }
}
