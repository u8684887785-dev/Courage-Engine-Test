<!DOCTYPE html>
<html lang="et">
<head>
  <meta charset="UTF-8">
  <title>Scene Editor v7.1</title>
  <style>
    :root { --tool-size: 32px; }
    body { margin: 0; font-family: 'Arial', sans-serif; user-select: none; display: flex; height: 100vh; background: #3d3d3d; }
    #ui { width: 280px; flex-shrink: 0; background: #2a2a2e; color: #fff; border-right: 1px solid #444; z-index: 100; display: flex; flex-direction: column; }
    #ui-content { padding: 15px; overflow-y: auto; flex-grow: 1; }
    #scene-container { flex-grow: 1; display: flex; justify-content: center; align-items: center; padding: 20px; overflow: auto; }
    #scene { position: relative; width: 1280px; height: 720px; background: #ffffff; overflow: hidden; border: 1px solid black; box-sizing: border-box; box-shadow: 0 10px 30px rgba(0,0,0,0.5); flex-shrink: 0; }
   
    #ui h3, #ui h4 { margin: 15px 0 5px 0; border-bottom: 1px solid #444; padding-bottom: 5px; font-family: 'Impact', sans-serif; text-transform: uppercase; letter-spacing: 1px; }
    #ui input, #ui button, #ui label, #ui select { width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box; background: #3c3c42; color: #fff; border: 1px solid #555; border-radius: 4px; }
    #ui label, #ui button { background: #c00; color: white; text-align: center; cursor: pointer; border: 2px solid black; font-weight: bold; }
    #ui .action-btn { display: inline-block; width: 49%; }
    #ui .action-btn:disabled { background: #555; cursor: not-allowed; }
    #ui input[type="file"] { display: none; }
    #ui input[type="color"] { padding: 0; height: 35px; border: 2px solid black; cursor: pointer; }
    #ui small { color: #aaa; font-size: 12px; display: block; margin-top: 10px; }

    .draggable { position: absolute; cursor: move; border: 2px solid transparent; }
    .draggable.selected { border: 2px dashed #007bff; }
    .resize-handle { position: absolute; width: 12px; height: 12px; background: #fff; border: 1px solid #007bff; right: -7px; bottom: -7px; cursor: se-resize; display: none; }
    .selected .resize-handle { display: block; }

    .uploaded-image { width: 100%; height: 100%; object-fit: cover; display: block; }
    .custom-text {
      font-weight: bold;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      padding: 6px;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      word-wrap: break-word;
      word-break: break-word;
      overflow: hidden;
    }

    .snap-line { position: absolute; background-color: #007bff; z-index: 10000; }
    .snap-line-v { width: 1px; }
    .snap-line-h { height: 1px; }

    #context-tools { position: absolute; top: 10px; right: 10px; background: #2a2a2e; padding: 5px; border-radius: 5px; z-index: 5000; display: none; }
    #context-tools button { background: none; border: none; color: white; cursor: pointer; padding: 5px; width: var(--tool-size); height: var(--tool-size); font-size: 18px; }
    #context-tools button:hover { background: #444; }

    #layers-panel { position: absolute; right: 20px; bottom: 20px; width: 200px; max-height: 200px; background: #2a2a2e; border-radius: 5px; z-index: 5000; display: flex; flex-direction: column; }
    #layers-panel h5 { margin: 0; padding: 8px; background: #3c3c42; text-align: center; font-size: 14px; }
    #layers-list { list-style: none; margin: 0; padding: 5px; overflow-y: auto; }
    #layers-list li { padding: 6px; cursor: pointer; border-radius: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px; }
    #layers-list li:hover { background: #444; }
    #layers-list li.selected { background: #007bff; }

    #crop-box { position: absolute; border: 2px solid #fff; box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5); display: none; z-index: 10001; }
    .crop-handle { position: absolute; width: 10px; height: 10px; background: #fff; border: 1px solid #000; }
    .crop-handle.nw { top: -6px; left: -6px; cursor: nwse-resize; }
    .crop-handle.ne { top: -6px; right: -6px; cursor: nesw-resize; }
    .crop-handle.sw { bottom: -6px; left: -6px; cursor: nesw-resize; }
    .crop-handle.se { bottom: -6px; right: -6px; cursor: nwse-resize; }
    #crop-actions { position: absolute; bottom: -40px; left: 50%; transform: translateX(-50%); }
    #crop-actions button { background: #fff; color: #000; border: none; padding: 8px 12px; cursor: pointer; margin: 0 5px; }
  </style>
</head>
<body>
  <div id="ui">
    <div id="ui-content">
      <h3>Scene Creator</h3>
      <button id="undoBtn" class="action-btn" disabled>Undo</button>
      <button id="redoBtn" class="action-btn" disabled>Redo</button>
      <hr>
      <label for="imageInput" id="imageLabel">Upload Image</label>
      <input type="file" id="imageInput" accept="image/*">
     
      <h4>Text</h4>
      <input type="text" id="textInput" value="" placeholder="Enter text">
      <button id="addTextBtn">Add Text</button>
      <small>Color and Size</small>
      <div style="display: flex; align-items: center; gap: 5px;">
        <input type="color" id="textColorInput" value="#ff0000" oninput="showColorPreview(this)" onmouseover="showColorPreview(this)" onmouseout="hideColorPreview(this)" style="flex-shrink: 0;">
        <span id="textColorPreview" style="display: none; width: 22px; height: 22px; border: 1px solid #888;"></span>
      </div>
      <input type="number" id="fontSizeInput" value="60" placeholder="Size (px)">

      <h4>Other</h4>
      <label for="bgColorInput">Background Color</label>
      <div style="display: flex; align-items: center; gap: 5px;">
        <input type="color" id="bgColorInput" value="#ffffff" oninput="showColorPreview(this)" onmouseover="showColorPreview(this)" onmouseout="hideColorPreview(this)" style="flex-shrink: 0;">
        <span id="bgColorPreview" style="display: none; width: 22px; height: 22px; border: 1px solid #888;"></span>
      </div>
    </div>
    <button id="saveImageBtn" style="margin: 15px; background: #28a745; border: none; padding: 12px; font-size: 16px;">Export as PNG</button>
  </div>

  <div id="scene-container">
    <div id="scene"></div>
  </div>

<script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
  <script>
    const scene = document.getElementById('scene');
    let selectedElement = null;
    let history = [];
    let historyIndex = -1;
    let nextZIndex = 1;
    const BASE_SCALE = 0.6;   // sinu "100%"
    let userZoom = 1;        // kasutaja suum

    const contextTools = document.createElement('div');
    contextTools.id = 'context-tools';
    contextTools.innerHTML = `<button id="cropBtn" title="Crop">✂️</button><button id="layerUpBtn" title="Layer Up">🔼</button><button id="layerDownBtn" title="Layer Down">🔽</button>`;
    scene.appendChild(contextTools);
    const cropBtn = document.getElementById('cropBtn');

    const layersPanel = document.createElement('div');
    layersPanel.id = 'layers-panel';
    layersPanel.innerHTML = `<h5>Layers</h5><ul id="layers-list"></ul>`;
    scene.appendChild(layersPanel);

    function saveState() {
      try {
        history = history.slice(0, historyIndex + 1);
        const elements = [];
        document.querySelectorAll('.draggable').forEach(el => {
            const content = el.firstChild;
            if (!content) return;
            const data = {
                left: el.style.left || '0px', top: el.style.top || '0px',
                width: el.style.width || `${el.offsetWidth}px`, height: el.style.height || `${el.offsetHeight}px`,
                zIndex: el.style.zIndex || '0', id: el.dataset.id
            };
            if (content.tagName === 'IMG') {
                data.type = 'image';
                data.src = content.src;
            } else {
                data.type = 'text';
                data.text = content.textContent;
                data.color = content.style.color || '#000';
                data.fontSize = content.style.fontSize || '20px';
                data.textStroke = content.style.webkitTextStroke || '';
            }
            elements.push(data);
        });
        const state = { content: JSON.stringify(elements), bgColor: scene.style.backgroundColor || '#ffffff' };
        history.push(state);
        historyIndex++;
        updateHistoryButtons();
        updateLayersPanel();
      } catch (err) {
        console.error('saveState error:', err);
      }
    }

    function restoreState(index) {
      if (index < 0 || index >= history.length) return;
      const state = history[index];

      document.querySelectorAll('.draggable').forEach(el => el.remove());

      let maxZ = 0;
      try {
        const elements = JSON.parse(state.content);
        elements.forEach(data => {
            const newEl = createElement(data, false);
            const z = parseInt(newEl.style.zIndex || 0);
            if (z > maxZ) maxZ = z;
        });
      } catch (err) {
        console.error('restoreState parse error:', err);
      }
      nextZIndex = maxZ + 1;
      scene.style.backgroundColor = state.bgColor;
      historyIndex = index;
      rebindAllListeners();
      updateHistoryButtons();
      updateLayersPanel();
      selectElement(null);
    }

    function createElement(data = {}, save = true) {
      const container = document.createElement('div');
      container.className = 'draggable';
      container.style.width = data.width || data.w || '200px';
      container.style.height = data.height || data.h || '120px';
      container.style.left = data.left || '10px';
      container.style.top = data.top || '10px';
      container.style.zIndex = data.zIndex || (nextZIndex++).toString();
      container.dataset.id = data.id || `el-${Date.now()}-${Math.floor(Math.random()*1000)}`;

      let contentElement;
      if (data.type === 'image') {
          contentElement = document.createElement('img');
          contentElement.src = data.src || '';
          contentElement.className = 'uploaded-image';
      } else {
          contentElement = document.createElement('div');
          contentElement.className = 'custom-text';
          contentElement.textContent = data.text || '';
          contentElement.style.color = data.color || '#000';
          contentElement.style.fontSize = data.fontSize || '20px';
          contentElement.style.webkitTextStroke = data.textStroke || '';
          contentElement.style.boxSizing = 'border-box';
          contentElement.style.width = '100%';
          contentElement.style.height = '100%';
          contentElement.style.padding = contentElement.style.padding || '6px';
          contentElement.style.whiteSpace = 'pre-wrap';
          contentElement.style.overflowWrap = 'anywhere';
          contentElement.style.wordWrap = 'break-word';
          contentElement.style.wordBreak = 'break-word';
          contentElement.style.overflow = 'hidden';
      }
      container.appendChild(contentElement);

      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle';
      container.appendChild(resizeHandle);

      try {
        scene.insertBefore(container, contextTools);
      } catch (err) {
        scene.appendChild(container);
      }

      if (save) {
        rebindAllListeners();
        selectElement(container);
        saveState();
      }
      return container;
    }

    function rebindAllListeners() {
      document.querySelectorAll('.draggable').forEach(el => {
        el.onmousedown = null;
        const handle = el.querySelector('.resize-handle');
        if (handle) handle.onmousedown = null;

        makeDraggable(el);
        makeResizable(el, handle);
        el.addEventListener('mousedown', (e) => { e.stopPropagation(); selectElement(el); }, { once: false });
      });
    }

    function selectElement(element) {
      if (selectedElement) selectedElement.classList.remove('selected');
      selectedElement = element;
     
      if (selectedElement) {
        selectedElement.classList.add('selected');
        contextTools.style.display = 'block';
        const isImage = selectedElement.firstChild && selectedElement.firstChild.tagName === 'IMG';
        if (cropBtn) cropBtn.style.display = isImage ? 'inline-block' : 'none';
      } else {
        contextTools.style.display = 'none';
      }
      updateLayersPanel();
    }

    function updateLayersPanel() {
        const layersList = document.getElementById('layers-list');
        if (!layersList) return;
        layersList.innerHTML = '';
        const elements = [...document.querySelectorAll('.draggable')].sort((a, b) => (parseInt(b.style.zIndex || 0)) - (parseInt(a.style.zIndex || 0)));
        elements.forEach(el => {
            const li = document.createElement('li');
            li.textContent = el.firstChild && el.firstChild.tagName === 'IMG' ? 'Image' : `Text: "${(el.firstChild && el.firstChild.textContent || '').substring(0, 10)}..."`;
            li.dataset.targetId = el.dataset.id;
            if (el === selectedElement) li.classList.add('selected');
            li.addEventListener('click', () => {
                const target = document.querySelector(`[data-id='${li.dataset.targetId}']`);
                if (target) selectElement(target);
            });
            layersList.appendChild(li);
        });
    }

    function changeLayer(direction) {
        if (!selectedElement) return;
        const elements = [...document.querySelectorAll('.draggable')].sort((a, b) => (parseInt(a.style.zIndex || 0)) - (parseInt(b.style.zIndex || 0)));
        const currentIndex = elements.findIndex(el => el === selectedElement);
       
        if (direction === 'up' && currentIndex > 0) {
            const otherEl = elements[currentIndex - 1];
            const tmp = selectedElement.style.zIndex;
            selectedElement.style.zIndex = otherEl.style.zIndex;
            otherEl.style.zIndex = tmp;
        } else if (direction === 'down' && currentIndex < elements.length - 1) {
            const otherEl = elements[currentIndex + 1];
            const tmp = selectedElement.style.zIndex;
            selectedElement.style.zIndex = otherEl.style.zIndex;
            otherEl.style.zIndex = tmp;
        }
        saveState();
    }

    function makeDraggable(element) {
      element.onmousedown = (e) => {
        if (e.target.classList.contains('resize-handle') || e.target.closest('#crop-box')) return;
        e.preventDefault();
        const sceneRect = scene.getBoundingClientRect();
        let shiftX = e.clientX - element.getBoundingClientRect().left;
        let shiftY = e.clientY - element.getBoundingClientRect().top;
        function onMouseMove(e) {
          let newLeft = e.clientX - shiftX - sceneRect.left;
          let newTop = e.clientY - shiftY - sceneRect.top;
          if (newLeft < 0) newLeft = 0;
          if (newTop < 0) newTop = 0;
          if (newLeft + element.offsetWidth > scene.clientWidth) newLeft = scene.clientWidth - element.offsetWidth;
          if (newTop + element.offsetHeight > scene.clientHeight) newTop = scene.clientHeight - element.offsetHeight;
          element.style.left = `${newLeft}px`;
          element.style.top = `${newTop}px`;
        }
        function onMouseUp() { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); saveState(); }
        document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp);
      };
    }
    function makeResizable(element, handle) {
      if (!handle) return;
      handle.onmousedown = (e) => {
        e.preventDefault(); e.stopPropagation();
        let startX = e.clientX, startY = e.clientY;
        let startWidth = element.offsetWidth, startHeight = element.offsetHeight;
        const isImage = element.firstChild && element.firstChild.tagName === 'IMG';
        const aspectRatio = startWidth / startHeight || 1;
        function onMouseMove(e) {
          let newWidth = startWidth + (e.clientX - startX);
          let newHeight = startHeight + (e.clientY - startY);
          if (isImage) { newHeight = newWidth / aspectRatio; }
          element.style.width = `${newWidth > 20 ? newWidth : 20}px`;
          element.style.height = `${newHeight > 20 ? newHeight : 20}px`;
        }
        function onMouseUp() { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); saveState(); }
        document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp);
      };
    }

    function initCrop(targetElement) {
        if (!targetElement || !targetElement.firstChild || targetElement.firstChild.tagName !== 'IMG') return;
        const image = targetElement.firstChild;
        const cropBox = document.createElement('div');
        cropBox.id = 'crop-box';
        scene.appendChild(cropBox);
        cropBox.style.left = targetElement.offsetLeft + 'px';
        cropBox.style.top = targetElement.offsetTop + 'px';
        cropBox.style.width = targetElement.offsetWidth + 'px';
        cropBox.style.height = targetElement.offsetHeight + 'px';
        cropBox.style.display = 'block';
        ['nw', 'ne', 'sw', 'se'].forEach(pos => {
            const handle = document.createElement('div');
            handle.className = `crop-handle ${pos}`;
            cropBox.appendChild(handle);
            makeCropResizable(cropBox, handle, pos);
        });
        const actions = document.createElement('div');
        actions.id = 'crop-actions';
        actions.innerHTML = `<button id="performCrop">Crop</button><button id="cancelCrop">Cancel</button>`;
        cropBox.appendChild(actions);
        document.getElementById('performCrop').onclick = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = image.src;
            img.onload = () => {
                const scaleX = img.naturalWidth / targetElement.offsetWidth;
                const scaleY = img.naturalHeight / targetElement.offsetHeight;
                const cropX = (cropBox.offsetLeft - targetElement.offsetLeft) * scaleX;
                const cropY = (cropBox.offsetTop - targetElement.offsetTop) * scaleY;
                const cropWidth = cropBox.offsetWidth * scaleX;
                const cropHeight = cropBox.offsetHeight * scaleY;
                canvas.width = cropWidth;
                canvas.height = cropHeight;
                ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
                image.src = canvas.toDataURL();
                targetElement.style.left = cropBox.offsetLeft + 'px';
                targetElement.style.top = cropBox.offsetTop + 'px';
                targetElement.style.width = cropBox.offsetWidth + 'px';
                targetElement.style.height = cropBox.offsetHeight + 'px';
                cropBox.remove();
                saveState();
            }
            img.onerror = () => { console.error('Crop: image failed to load'); cropBox.remove(); alert('Failed to load image for cropping'); };
        };
        document.getElementById('cancelCrop').onclick = () => cropBox.remove();
    }
    function makeCropResizable(box, handle, position) {
        handle.onmousedown = (e) => {
            e.preventDefault(); e.stopPropagation();
            let startX = e.clientX, startY = e.clientY;
            let startLeft = box.offsetLeft, startTop = box.offsetTop;
            let startWidth = box.offsetWidth, startHeight = box.offsetHeight;
            function onMouseMove(e) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                if (position.includes('e')) box.style.width = `${startWidth + dx}px`;
                if (position.includes('w')) { box.style.width = `${startWidth - dx}px`; box.style.left = `${startLeft + dx}px`; }
                if (position.includes('s')) box.style.height = `${startHeight + dy}px`;
                if (position.includes('n')) { box.style.height = `${startHeight - dy}px`; box.style.top = `${startTop + dy}px`; }
            }
            function onMouseUp() { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); }
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };
    }

    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    function updateHistoryButtons() { undoBtn.disabled = historyIndex <= 0; redoBtn.disabled = historyIndex >= history.length - 1; }
    undoBtn.addEventListener('click', () => restoreState(historyIndex - 1));
    redoBtn.addEventListener('click', () => restoreState(historyIndex + 1));
   
    const imageInput = document.getElementById('imageInput');
    const imageLabel = document.getElementById('imageLabel');

    imageLabel.addEventListener('click', (e) => {
      e.preventDefault();
      try {
        imageInput.click();
      } catch (err) {
        imageInput.style.display = 'block';
        imageInput.focus();
      }
    });

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const aspectRatio = img.naturalWidth / img.naturalHeight || 1;
                const w = 300, h = w / aspectRatio;
                createElement({ type: 'image', src: ev.target.result, width: `${w}px`, height: `${h}px`, left: `${Math.max(10, (scene.clientWidth - w) / 2)}px`, top: `${Math.max(10, (scene.clientHeight - h) / 2)}px`, zIndex: (nextZIndex++).toString() });
            };
            img.onerror = (err) => console.error('Image load error:', err);
            img.src = ev.target.result;
        };
        reader.onerror = (err) => console.error('FileReader error:', err);
        reader.readAsDataURL(file);
        imageInput.value = '';
    });

    document.getElementById('addTextBtn').addEventListener('click', () => {
        const text = document.getElementById('textInput').value.trim(); if (!text) return;
        const w = 450, h = 80;
        createElement({ type: 'text', text: text, color: document.getElementById('textColorInput').value, fontSize: document.getElementById('fontSizeInput').value + 'px', textStroke: `2px black`, width: `${w}px`, height: `${h}px`, left: `${Math.max(10, (scene.clientWidth - w) / 2)}px`, top: `${Math.max(10, (scene.clientHeight - h) / 2)}px`, zIndex: (nextZIndex++).toString() });
    });

    const bgInput = document.getElementById('bgColorInput');
    bgInput.addEventListener('input', (e) => { scene.style.backgroundColor = e.target.value; });
    bgInput.addEventListener('change', (e) => { saveState(); });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && selectedElement) { e.preventDefault(); selectedElement.remove(); selectElement(null); saveState(); }
      if (e.ctrlKey && (e.key === 'd' || e.key === 'D') && selectedElement) {
        e.preventDefault();
        if (history[historyIndex]) {
            try {
                const elements = JSON.parse(history[historyIndex].content || '[]');
                const data = elements.find(d => d.id === selectedElement.dataset.id);
                if(data) {
                    const newData = JSON.parse(JSON.stringify(data));
                    newData.left = `${parseInt(newData.left || 0) + 20}px`;
                    newData.top = `${parseInt(newData.top || 0) + 20}px`;
                    newData.zIndex = (nextZIndex++).toString();
                    delete newData.id;
                    createElement(newData);
                }
            } catch (err) { console.error('Duplicate error:', err); }
        }
      }
    });

    if (cropBtn) cropBtn.addEventListener('click', () => { if (selectedElement) initCrop(selectedElement); });
    document.getElementById('layerUpBtn').addEventListener('click', () => changeLayer('up'));
    document.getElementById('layerDownBtn').addEventListener('click', () => changeLayer('down'));
    scene.addEventListener('click', (e) => { if (e.target === scene) selectElement(null); });
   
    document.getElementById('saveImageBtn').addEventListener('click', async () => {
  const prevSelected = selectedElement;
  selectElement(null);

  const temp = document.createElement('div');
  temp.style.position = 'absolute';
  temp.style.left = '-9999px';
  temp.style.top = '0';
  temp.style.width = `${scene.clientWidth}px`;
  temp.style.height = `${scene.clientHeight}px`;
  temp.style.background = scene.style.backgroundColor || '#ffffff';
  temp.style.boxSizing = 'border-box';
  temp.style.overflow = 'hidden';
  temp.style.border = getComputedStyle(scene).border || 'none';
  temp.style.boxShadow = 'none';
  temp.style.padding = '0';
  temp.style.margin = '0';

  const draggables = [...document.querySelectorAll('.draggable')];

  function blobToDataURL(blob) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(blob);
    });
  }

  async function fetchImageAsDataURL(src) {
    try {
      const resp = await fetch(src, { mode: 'cors' });
      if (!resp.ok) throw new Error('fetch failed ' + resp.status);
      const blob = await resp.blob();
      return await blobToDataURL(blob);
    } catch (err) {
      return null;
    }
  }

  const loadPromises = [];
  const failedImages = [];

  for (const orig of draggables) {
    const box = document.createElement('div');
    box.style.position = 'absolute';
    box.style.left = orig.style.left || `${orig.offsetLeft}px`;
    box.style.top = orig.style.top || `${orig.offsetTop}px`;
    box.style.width = orig.style.width || `${orig.offsetWidth}px`;
    box.style.height = orig.style.height || `${orig.offsetHeight}px`;
    box.style.zIndex = orig.style.zIndex || '0';
    box.style.boxSizing = 'border-box';
    box.style.overflow = 'hidden';
    box.style.border = 'none';

    const content = orig.firstChild;
    if (content && content.tagName === 'IMG') {
      const img = document.createElement('img');
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.display = 'block';
      const src = content.src || '';

      if (!src) {
        box.appendChild(img);
        continue;
      }

      const p = (async () => {
        try {
          if (src.startsWith('data:')) {
            img.src = src;
            await new Promise((r) => {
              if (img.complete) return r();
              img.onload = img.onerror = r;
            });
          } else {
            const dataUrl = await fetchImageAsDataURL(src);
            if (dataUrl) {
              img.src = dataUrl;
              await new Promise((r) => {
                if (img.complete) return r();
                img.onload = img.onerror = r;
              });
            } else {
              img.crossOrigin = 'anonymous';
              img.src = src;
              await new Promise((r) => {
                img.onload = () => r();
                img.onerror = () => {
                  failedImages.push(src);
                  r();
                };
              });
            }
          }
        } catch (err) {
          console.warn('image handling error:', src, err);
          failedImages.push(src);
        }
      })();
      loadPromises.push(p);
      box.appendChild(img);
    } else {
      const txt = document.createElement('div');
      txt.textContent = content ? content.textContent : '';
      const cs = content ? getComputedStyle(content) : getComputedStyle(orig);
      txt.style.color = cs.color;
      txt.style.fontSize = cs.fontSize;
      txt.style.fontWeight = cs.fontWeight;
      txt.style.textTransform = cs.textTransform;
      txt.style.display = 'flex';
      txt.style.alignItems = 'center';
      txt.style.justifyContent = 'center';
      txt.style.textAlign = cs.textAlign;
      txt.style.whiteSpace = 'pre-wrap';
      txt.style.overflowWrap = 'anywhere';
      txt.style.wordWrap = 'break-word';
      txt.style.wordBreak = 'break-word';
      txt.style.width = '100%';
      txt.style.height = '100%';
      txt.style.boxSizing = 'border-box';
      box.appendChild(txt);
    }
    temp.appendChild(box);
  }

  document.body.appendChild(temp);

  try {
    await Promise.all(loadPromises);
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch (_) { }
    }

    const scale = 1;
    const canvas = await html2canvas(temp, {
      backgroundColor: scene.style.backgroundColor || '#ffffff',
      width: scene.clientWidth,
      height: scene.clientHeight,
      scale,
      useCORS: true,
      allowTaint: false
    });

    const link = document.createElement('a');
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = `scene-export-${ts}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    if (failedImages.length) {
      console.warn('Some external images failed to load due to CORS:', failedImages);
      alert('Some images may be blocked by CORS and will not appear in the exported PNG. Try uploading images directly from your computer instead of using external URLs.');
    }
  } catch (err) {
    console.error('html2canvas error:', err);
    alert('Error creating image. Check browser console (F12) for details. Common cause: images from external servers without CORS headers (canvas "taint").');
  } finally {
    temp.remove();
    if (prevSelected) selectElement(prevSelected);
  }
    });

    function showColorPreview(input) {
      const previewId = input.id === "textColorInput" ? "textColorPreview" : "bgColorPreview";
      const preview = document.getElementById(previewId);
      if (preview) {
        preview.style.display = "inline-block";
        preview.style.background = input.value;
      }
    }
    function hideColorPreview(input) {
      const previewId = input.id === "textColorInput" ? "textColorPreview" : "bgColorPreview";
      const preview = document.getElementById(previewId);
      if (preview) {
        preview.style.display = "none";
      }
    }
   
    saveState();
  </script>
</body>
</html>

