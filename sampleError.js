
function InitializeDemo() {
  ripl = new ripl(); // Create a RIPL client object to communicate with the engine.
  ripl.clearTrace(); // Clear the engine state.
  obs_noise_directive_id = ripl.assume('obs_noise', '(uniform-continuous 0.1 1.0)')['d_id'];
  physics_noise_directive_id = ripl.assume('physics_noise', '(uniform-continuous 0.1 1.0)')['d_id'];
  
  

}