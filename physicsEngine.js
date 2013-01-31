// Javascript for the Stochastic 2D physics engine built by Andres Romero. This js is based on the CRP demo, credit to Ardavan Saeedi.



//Global Timer
time = 0;
timerid = 0;
canvas = new Object();
predicted_coords_x = new Array();
predicted_coords_y = new Array();

function InitializeDemo() {
  ripl = new ripl(); // Create a RIPL client object to communicate with the engine.
  ripl.clearTrace(); // Clear the engine state.
  
  //Define noise params
  obs_noise_directive_id = ripl.assume('obs_noise', '(uniform-continuous 0.0001 0.001)')['d_id'];
  physics_noise_directive_id = ripl.assume('physics_noise', '(uniform-continuous 0.0001 0.001)')['d_id'];
  
  // Define the generic model:
  predicted_coords_x = new Array();
  predicted_coords_y = new Array();
  ripl.assume('initial-pos-x','(uniform-continuous r[0] r[400.0])');
  ripl.assume('initial-vel-x','(uniform-continuous r[-400.0] r[400.0])');
  ripl.assume('force-x','(uniform-continuous r[-40.0] r[40.0])');
  ripl.assume('pos-x','(mem (lambda (time) (if (= time c[0]) initial-pos-x (+ (pos-x (dec time)) initial-vel-x (* force-x time)(uniform-continuous 0.0 0.01)))))')['d_id'];
  
  ripl.assume('initial-pos-y','(uniform-continuous r[0] r[400.0])');
  ripl.assume('initial-vel-y','(uniform-continuous r[-400.0] r[400.0])');
  ripl.assume('force-y','(uniform-continuous r[-40.0] r[40.0])'); 
  ripl.assume('pos-y','(mem (lambda (time) (if (= time c[0]) initial-pos-y (+ (pos-y (dec time)) initial-vel-y (* force-y time)(uniform-continuous 0.0 0.01)))))')['d_id'];

  all_points = new Object(); // Init a JavaScript dictionary to save current points.
  next_point_unique_id = 0;
  
  x = new Array();
  
  for (var i=0; i < 10; i++ ) {
    predicted_coords_x[i] = ripl.predict('(pos-x c[' + i + '])')['d_id'];
  }
    
  for (var i=0; i < 10; i++ ) {
    predicted_coords_y[i] = ripl.predict('(pos-y c[' + i + '])')['d_id'];
  }

  
    
  ripl.predict('initial-vel-x');
  ripl.predict('initial-vel-y');
  ripl.predict('force-x');
  ripl.predict('force-y');

  ripl.start_cont_infer(1); // Start the continuous ("infinite") inference.
  
  // Prepare the canvas in your browser.
  canvas = d3.select('#graphics_div').append("svg").attr("width",420).attr("height",420).style("stroke","gray").on("click",function(d) {
    if (time > 10) {
      return;
    }
    if (next_point_unique_id == 3) {
      return;
    }
    // If user clicks on the plot, create a new point.
    var point = new Object();
    
    // Coordinates in the browser window:
    point.html_x = d3.event.x;
    point.html_y = d3.event.y;
    
    // Create and pretty a circle on the plot.
    canvas.append("circle").style("stroke","gray").style("fill","grey")
      .attr("r",5)
      .attr("cx",point.html_x)
      .attr("cy",point.html_y)
    
    //point.observation_id = ripl.observe(observation_expression, "r[" + point.plot_math_y + "]")['d_id'];
    point.unique_id = next_point_unique_id;

    if (point.unique_id == 0) {
      point.observation_idx = ripl.observe('(normal (pos-x c[0]) obs_noise)', 'r[' + point.html_x + ']');
      point.observation_idx = ripl.observe('(normal (pos-y c[0]) obs_noise)', 'r[' + point.html_y + ']');
      timerid = setInterval("updateTime();",1000);
    }
    else {
      point.observation_idx = ripl.observe('(normal (pos-x c[' + time + ']) obs_noise)', 'r[' + point.html_x + ']');
      point.observation_idy = ripl.observe('(normal (pos-y c[' + time + ']) obs_noise)', 'r[' + point.html_y + ']');
    }
    
    // Save the point to the dictionary of all current points.
    all_points[point.unique_id] = point;
    
    next_point_unique_id++;
  });
}

function updateTime() {
  time += 1;
  if (time > 10) {
    ripl.infer(1000);
    requestPath();
    clearInterval(timerid);
  }
}

function requestPath() {
  ripl.stop_cont_infer(); // Stop the continuous inference in order to get all necessary
                          // data from the engine from the *same* model state
                          // (i.e. from the *same sample*).
                          
  // Get the data from the current model state:
  current_obs_noise = ripl.report_value(physics_noise_directive_id)['val'];
  current_phys_noise = ripl.report_value(obs_noise_directive_id)['val'];
  var points = new Array();
  for (var i=0; i < 10; i++ ) {
    x = ripl.report_value(predicted_coords_x[i])['val'];
    y = ripl.report_value(predicted_coords_y[i])['val'];
    points[i] = {"x":x,"y":y};
  }
  drawPath(points);
  //testpoints = new Array();
  //testpoints[0] = {"x":41,"y":139};
  //testpoints[1] = {"x":142,"y":67};
  //testpoints[2] = {"x":233,"y":170};
  //drawPath(testpoints);
  ripl.start_cont_infer(1);
  timerid = setInterval("updateTime();",1000);
  
}

function drawPath(points) {
  var lineFunction = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate("linear");
  canvas.append("path")
    .attr("d", lineFunction(points))
    .attr("stroke", "blue")
    .attr("stroke-width", 2)
    .attr("fill", "none");
}
