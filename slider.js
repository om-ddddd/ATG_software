const slider_vscale = document.getElementById('v_scale');
const slider_vposition = document.getElementById('v_position');
const slider_hscale = document.getElementById('h_scale');
const slider_hposition = document.getElementById('h_position');
const osc1 = document.getElementById('input_1');
const osc2 = document.getElementById('input');
const osc = document.getElementById('oscilloscope');

slider_vscale.addEventListener('input', function () {
  const value = this.value;

  // Update the vertical-scale attribute
  osc1.setAttribute('vertical-scale', value);
  osc2.setAttribute('vertical-scale', value);
});


slider_vposition.addEventListener('input', function () {
  const value = this.value;

  // Update the vertical-scale attribute
  osc1.setAttribute('vertical-pos', value);
  osc2.setAttribute('vertical-pos', value);
});

slider_hscale.addEventListener('input', function () {
  const value = this.value;

  // Update the vertical-scale attribute
  osc.setAttribute('horizontal-zoom', value);
  
});


slider_hposition.addEventListener('input', function () {
  const value = this.value;

  // Update the vertical-scale attribute
  osc.setAttribute('horizontal-pos', value);
  
});