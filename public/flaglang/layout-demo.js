(() => {
  const mode = document.getElementById('layout-mode');
  const logical = document.getElementById('layout-cells');
  const physical = document.getElementById('physical-cells');
  const result = document.getElementById('layout-result');
  let selected = 5;
  function address(i, kind) {
    const r = Math.floor(i / 4), c = i % 4;
    if (kind === 'tile') return 8 * Math.floor(r / 2) + 4 * Math.floor(c / 2) + 2 * (r % 2) + c % 2;
    if (kind === 'xor') return 4 * r + (c ^ r);
    return 4 * r + c;
  }
  const buttons = Array.from({length: 16}, (_, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `(${Math.floor(i / 4)}, ${i % 4})`;
    button.addEventListener('click', () => { selected = i; render(); });
    logical.appendChild(button);
    return button;
  });
  const slots = Array.from({length: 16}, (_, i) => {
    const slot = document.createElement('span');
    slot.textContent = i;
    physical.appendChild(slot);
    return slot;
  });
  function render() {
    const offset = address(selected, mode.value);
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === selected)));
    slots.forEach((slot, i) => { slot.className = i === offset ? 'active' : ''; });
    result.textContent = `逻辑坐标 (${Math.floor(selected / 4)}, ${selected % 4}) → 物理位置 ${offset}（元素偏移）`;
  }
  mode.addEventListener('change', render);
  render();
})();
