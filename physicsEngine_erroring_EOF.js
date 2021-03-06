// Javascript for the Stochastic 2D physics engine built by Andres Romero. This js is based on the CRP demo, credit to Ardavan Saeedi.

// Global variable to save the all the current path predictions
currentPathPredictions =  new Object();

//Global list to store the next predicted x and y for each point
currentCoordPredictions = new Object();

//Global Timer
time = 0;
timerid = 0;

function InitializeDemo() {
  ripl = new ripl(); // Create a RIPL client object to communicate with the engine.
  ripl.clearTrace(); // Clear the engine state.
  
  //Define noise params
  obs_noise_directive_id = ripl.assume('obs_noise', '(uniform-continuous 0.1 1.0)')['d_id'];
  physics_noise_directive_id = ripl.assume('physics_noise', '(uniform-continuous 0.1 1.0)')['d_id'];
  
  // Define the generic model:
  predicted_coords = new Array();
  
  ripl.assume('initial-pos-x','(mem (normal 0.0 1.0))');
  ripl.assume('initial-vel-x','(mem (normal 0.0 1.0))');
  ripl.assume('force-x','(mem (normal 0.0 1.0))');
  predicted_coords[0] = ripl.assume('pos-x','(mem (lambda (time) (if (= time c[0]) (initial-pos-x) (+ (pos-x (dec time))(initial-vel-x)(force-x)(normal 0.0 0.01))');
  
  ripl.assume('initial-pos-y','(mem (normal 0.0 1.0))');
  ripl.assume('initial-vel-y','(mem (normal 0.0 1.0))');
  ripl.assume('force-y','(mem (+ 9.8 (normal 0.0 1.0)))');
  predicted_coords[1] = ripl.assume('pos-y','(mem (lambda (time) (if (= time c[0]) (initial-pos-y) (+ (pos-y (dec time))(initial-vel-y)(force-y)(normal 0.0 0.01))');
  ripl.start_cont_infer(1); // Start the continuous ("infinite") inference.

  // Prepare the canvas in your browser.
  var canvas = d3.select('#graphics_div').append("canvas").attr("width",420).attr("height",420).style("stroke","gray");
  
  all_points = new Object(); // Init a JavaScript dictionary to save current points.
  next_point_unique_id = 0;
  
  for (i in range(0,100)) {
    ripl.predict('pos-x','c[' + i + ']');
  }
    
  for (i in range(0,100)) {
    ripl.predict('pos-y', 'c[' + i + ']');
  }

    
  ripl.predict('initial-velocity-x');
  ripl.predict('initial-velocity-y');
  ripl.predict('force-x');
  ripl.predict('force-y');
    
  
  
  background.click(function(background_event) {
    if (time > 100) {
      return;
    }
    if (next_point_unique_id == 3) {
      return;
    }
    // If user clicks on the plot, create a new point.
    var point = new Object();
    
    // Coordinates in the browser window:
    point.html_x = background_event.pageX - $('#graphics_div').offset().left;
    point.html_y = background_event.pageY - $('#graphics_div').offset().top;
    
    // Create and pretty a circle on the plot.
    canvas.append("circle").style("stroke","gray").style("fill","grey")
      .attr("r",5)
      .attr("cx",point.html_x)
      .attr("cy",point.html_y)
    
    //point.observation_id = ripl.observe(observation_expression, "r[" + point.plot_math_y + "]")['d_id'];
    point.unique_id = next_point_unique_id;

    if (point.unique_id == 0) {
      point.observation_idx = ripl.observe('(pos-x c[0])', 'r[' + point.html_x + ']');
      point.observation_idy = ripl.observe('(pos-y c[0])', 'r[' + point.html_y + ']');
      timerid = setInterval("updateTime();",100);
    }
    else {
      point.observation_idx = ripl.observe('(pos-x c[' + time + '])', 'r[' + point.html_x + ']');
      point.observation_idy = ripl.observe('(pos-y c[' + time + '])', 'r[' + point.html_y + ']');
    }
    
    // Save the point to the dictionary of all current points.
    all_points[point.unique_id] = point;
    
    next_point_unique_id++;
  });
}

function updateTime() {
  time += 1;
  if (time > 100) {
    requestPath();
    clearInterval(timerid);
  }
}

function requestPath() {
  ripl.stop_cont_infer(); // Stop the continuous inference in order to get all necessary
                          // data from the engine from the *same* model state
                          // (i.e. from the *same sample*).
                          
  // Get the data from the current model state:
  current_obs_noise = ripl.report_value(physic_noise_directive_id)['val'];
  current_phys_noise = ripl.report_value(obs_noise_directive_id)['val'];
  var points = new Array();
  for (i in range(0,100)) {
    x = ripl.report_value(predicted_coords[0])['val'];
    y = ripl.report_value(predicted_coords[1])['val'];
    points[i] = [x,y];
  }
  drawPath(points);
  
  ripl.start_cont_infer(1);
  
}

function drawPath(points) {
  canvas.append("path").data([points]).attr('d',line).style("stoke","#000000");
}
