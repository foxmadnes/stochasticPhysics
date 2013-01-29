
function InitializeDemo() {
  ripl = new ripl(); // Create a RIPL client object to communicate with the engine.
  ripl.clearTrace(); // Clear the engine state.
  
  ripl.assume('pos-x','(mem (lambda (time) (+ 1 1)');

}