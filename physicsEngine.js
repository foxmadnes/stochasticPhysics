// Javascript for the Stochastic 2D physics engine built by Andres Romero. This js is based on the CRP demo, credit to Ardavan Saeedi.


// Global variable to save the all the current path predictions
currentPathPredictions =  new Object();

//Global list to store the next predicted x and y for each point
currentCoordPredictions = new Object();

function InitializeDemo() {
  ripl = new ripl(); // Create a RIPL client object to communicate with the engine.
  ripl.clearTrace(); // Clear the engine state.
  
  // Define the generic model:
  predicted_coords = new Array();
  
  ripl.assume('initial-pos-x',parse('(mem (lambda (id) (normal 0.0 1.0)))'));
  ripl.assume('initial-vel-x',parse('(mem (lambda (id) (normal 0.0 1.0)))'));
  ripl.assume('force-x',parse('(mem (lambda (id) (normal 0.0 1.0)))'));
  predicted_coords[0] = ripl.assume('pos-x',parse('(mem (lambda (id time) (if (= time c[0]) (initial-pos-x id) (+ pos-x (dec time))(initial-vel-x id)(force-x id)(normal 0.0 0.01))'));
  
  ripl.assume('initial-pos-y',parse('(mem (lambda (id) (normal 0.0 1.0)))'));
  ripl.assume('initial-vel-y',parse('(mem (lambda (id) (normal 0.0 1.0)))'));
  ripl.assume('force-y',parse('(mem (lambda (id) (+ 9.8 (normal 0.0 1.0))))'));
  predicted_coords[1] = ripl.assume('pos-y',parse('(mem (lambda (id time) (if (= time c[0]) (initial-pos-y id) (+ pos-y (dec time))(initial-vel-y id)(force-y id)(normal 0.0 0.01))'));
  ripl.start_cont_infer(1); // Start the continuous ("infinite") inference.

  // Prepare the canvas in your browser.
  paper = Raphael($('#graphics_div')[0], 420, 420);
  background = paper.rect(0, 0, 420, 420).attr({fill: "white"});
  LabelPlot();
  
  all_points = new Object(); // Init a JavaScript dictionary to save current points.
  next_point_unique_id = 0;
  
  background.mousedown(function(background_event) {
    // If user clicks on the plot, create a new point.
    var point = new Object();
    
    // Coordinates in the browser window:
    point.html_x = background_event.pageX - $('#graphics_div').offset().left;
    point.html_y = background_event.pageY - $('#graphics_div').offset().top;
    
    //Initialize velocities:
    point.velocity_x = 0;
    point.velocity_y = 0;
    
    //Make sure the point is not yet affected by forces
    point.is_moving = false;
    
    // "Mathematical" coordinates on the canvas (relative to the plot centre):
    point.plot_math_x = (point.html_x - (420 / 2)) / 20;
    point.plot_math_y = ((point.html_y - (420 / 2)) * -1) / 20;
    
    // Create and pretty a circle on the plot.
    point.circle = paper.circle(point.html_x, point.html_y, 5);
    point.circle.attr("fill", "black");
    
    // Send information about this data point to the engine.
    //var observation_expression = '(normal (polynomial-function (normal r[' + point.plot_math_x + '] noise)) noise)';

    //point.observation_id = ripl.observe(observation_expression, "r[" + point.plot_math_y + "]")['d_id'];
    point.unique_id = next_point_unique_id;
    
    for (i in range(0,10)) {
      ripl.predict('pos-x','a[' + + point.unique_id + '] c[' + i + ']');
    }
    
    for (i in range(0,10)) {
      ripl.predict('pos-y','a[' + + point.unique_id + '] c[' + i + ']');
    }
    
    currentCoordPredictions[point_unique_id] = [point.plot_math_x,point.plot_math_y];
    
    ripl.predict('initial-velocity-x', 'a[' + point_unique_id + ']');
    ripl.predict('initial-velocity-y', 'a[' + point_unique_id + ']');
    ripl.predict('force-x', 'a[' + point_unique_id + ']');
    ripl.predict('force-y', 'a[' + point_unique_id + ']');
    
    ripl.observe('(pos-x a[' + point.unique_id + '] c[0])', 'r[' + point.plot_math_x + ']');
    ripl.observe('(pos-y a[' + point.unique_id + '] c[0])', 'r[' + point.plot_math_y + ']');
    
    //First prediction will be non-moving, but will not last very long
    currentPathPredictions[point.unique_id] = new Line(point.html_x,point.html_y,point.html_x,point.html_y,paper);
    
    //After one second, assume that there is no mouseup event, and set forces to affect this point
    setTimeout("setMoving(point);",1000);
    
    // Save the point to the dictionary of all current points.
    all_points[point.unique_id] = point;
    point.circle.data("point_reference", point);
    next_point_unique_id++;
    point.circle.click(function(circle_event) {
      // If user clicks on the point, delete it.
      ripl.forget(this.data("point_reference").observation_id); // Remove it from the engine trace.
      delete all_points[this.data("point_reference").unique_id]; // Remove it from the dictionary of all current points.
      this.remove(); // Remove the point from the paper.
    });
  });
  
  // Once letting go of the mouse, add the perceived velocity to the last point
  background.mouseup(function(background_event) {
    //User has clicked and dragged elsewhere, so the point has velocity, find the velocity
    arrow_x = background_event.pageX - $('#graphics_div').offset().left;
    arrow_y = background_event.pageY - $('#graphics_div').offset().top;
    point = all_points[next_point_unique_id - 1];
    point.velocity_x = point.html_x - arrow_x;
    point.velocity_y = point.html_y - arrow_y;
    ripl.observe('(initial-velocity-x a[' + next_point_unique_id + '])', 'r[' + point.velocity_x + ']');
    ripl.observe('(initial-velocity-y a[' + next_point_unique_id + '])', 'r[' + point.velocity_y + ']');
    point.is_moving = true;
  });
  
  // Run first time the function GetAndDrawCurrentSample().
  // Next setTimeout(...) are being called in this function itself.
  // (FYI, setTimeout(..., msec) runs the function only once after X msec instead
  //  of setInterval(..., msec), which continuously runs the function each X msec.)
  setTimeout("updatePossiblePaths();",10);
  setTimeout("updatePath();",100);
}

function updatePath() {
  for (point_unique_id in all_points) {
    point = all_points[point_unique_id];
    if (point.is_moving) {
      point = all_points[point_unique_id];
      [new_x,new_y] = currentCoordPredictions[point_unique_id];
      point.circle.animate({cx: new_x, cy: new_y,cr: 5}, 400, "linear");
      ripl.observe('(pos-x a[' + point.unique_id + '] c[0])', 'r[' + new_x + ']');
      ripl.observe('(pos-y a[' + point.unique_id + '] c[0])', 'r[' + new_y + ']');
    }
  }
  setTimeout("updatePath();",100);
}

function setMoving(point) {
  point.is_moving = true;
}

function updatePossiblePaths() {
  ripl.stop_cont_infer();
  
  for (point_unique_id in all_points) {
    point = all_points[point_unique_id];
    if (point.is_moving) {
      predictedPoints =  new Object();
      
      for (i in range(0,10)) {
        x = ripl.report_value(predicted_coords[0][point_unique_id][i]);
        y = ripl.report_value(predicted_coords[1][point_unique_id][i]);
        predictedPoints[i] = [x,y];
        if (i == 1) {
          currentCoordPredictions[point_unique_id] = [x,y];
        }
      }
      
      if  (currentPathPredictions[point_unique_id] != undefined) {
        currentPathPredictions[point_unique_id].remove();
      }
      
      currentPathPredictions[point_unique_id] = createPath(predictPoints);
    }
  }
  
  ripl.start_cont_infer(1);
  setTimeout("updatePossiblePaths();",10);
}

// Marking up the canvas (just for user's convenience).
function LabelPlot() {
  var currentObject;
  for (var x = 0; x <= 400; x = x + (400) / 10) {
    currentObject = paper.path("M" + (x + 10) + " 0L" + (x + 10) + " 420");
    currentObject.attr("stroke-dasharray", "-");
    currentObject.attr("stroke-width", "0.2");
    currentObject = paper.path("M0 " + (x + 10) + "L420 " + (x + 10) + "");
    currentObject.attr("stroke-dasharray", "-");
    currentObject.attr("stroke-width", "0.2");

    currentObject = paper.text(x + 10, 15, "" + (((x / 40) - 5) * 2) + "");
    currentObject.attr("fill", "#aaaaaa");

    if (x != 0) {
      currentObject = paper.text(10, x + 10, "" + (((x / 40) - 5) * -2) + "");
      currentObject.attr("fill", "#aaaaaa");
    }
  }

  currentObject = paper.circle(420 / 2, 420 / 2, 2);
  currentObject = paper.text(420 / 2 + 20, 420 / 2, "(0; 0)");
  currentObject.attr("fill", "#aaaaaa");
}
