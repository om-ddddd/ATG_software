const slider = document.getElementById('scale');
const osc1 = document.getElementById('input_1');
const osc2 = document.getElementById('input');

slider.addEventListener('input', function () {
  const value = this.value;

  // Update the vertical-scale attribute
  osc1.setAttribute('vertical-scale', value);
  osc2.setAttribute('vertical-scale', value);
});