function randomGradient(randomNumber,colourDivSelector){	
	/* let's first declare some of the arrays we'll need... */
	var colourSet = [], twoByTwo = []; 
	var stopArray = [], withStop = [];
	var outputArray = [];
	
	var colourDiv = checkVariableType(colourDivSelector); // declare colourdiv variable to get the correct div and save the result of the function
	var style = window.getComputedStyle(colourDiv).getPropertyValue("background-image"); // read the colour from the property
				
	// when people are stupid and try to give me a background that isn't a gradient
	if(style.indexOf('gradient')<0){
		console.log("this element does not have a gradient background!");
		return 1;
	}
			
	var gradient = (style.slice(style.indexOf('gradient'),-1)).split("gradient(")[1]; // get the stuff inside the brackets i.e. "to right, rgb....."
	var colourArray = gradient.replace(/\s+/g, '').split(","); // delete all the whitespaces and split by comma
	if(gradient.includes("to ") || gradient.includes("deg") || gradient.includes("rad")) // check if user has included a direction for the gradient
		colourArray.shift(); // remove the first element of array i.e. the direction
	
	/* now we have to do a bit of work... bc the rgb colours messed up when we used commas to split earlier */
	var indexArrayRGB = []; // store index of rgb colours
	var indexArrayWord = []; // store index of word colours
	for(var i=0; i<colourArray.length; i++){ // run a loop to check all the elements of the array
		var str = colourArray[i].toLowerCase(); // the string to check
		if(str.indexOf("rgb") > -1) // check if string indicates start of rgb colour
			indexArrayRGB.push(i); // if yes, add its index to the array of rgb indices
		else if(str.match(/[a-z]/i)) // otherwise if string is a word colour
			indexArrayWord.push(i); // add its ndex to the array of word colour indices
	} // end loop

	var newArray = []; // declare a new array to store our colours
	for(var j=0; j<colourArray.length; j++){ // run a loop for each element of the array... again (why? we need our index arrays to be completely built first before running this next loop)
		if(indexArrayWord.includes(j)) // check if the array of word indices includes the current element's index
			newArray.push(colourArray[j]); // if yes, add the current element to the colour array
		else if(indexArrayRGB.includes(j)){ // otherwise, check if array of rgb indices includes the current element's index
			var tempArray = []; // if yes, we make a new array, then join the following values to make a full rgb string
			for(var x=j; x<j+3; x++) // here's the loop to make a new array with the r, g and b value strings
				tempArray.push(colourArray[x]);
			newArray.push(tempArray.join()); // the reason for making an array is so i can use .join() :D it's more robust than just adding strings together.
		} // end else
	} // end outer loop
	
	// now we run a loop for the array of colours to get rid of all the unwanted bits
	for(var k=0; k<newArray.length; k++){
		if(newArray[k].includes("%")){ // if the person specified colour stops
			withStop.push(k); // add the current index to the list of colour stop indices
			if(newArray[k].includes(")")){ // if rgb type colour
				var strSpl = newArray[k].split(")"); // split string
				stopArray.push(strSpl[1].slice(0,-1)); // save the stop
				newArray[k] = strSpl[0]+")"; // get rid of the colour stops to save the colour into the array
			} // end if
			else if(newArray[k].match(/[a-z]/i)){ // if word colour
				stopArray.push(newArray[k].match(/\d/g).join("")); // save the stop (join all the numbers together)
				newArray[k] = newArray[k].split(newArray[k].match(/\d/))[0]; // save the colour (word)
			} // end else
		} // end if stopped
		else 
			stopArray.push(0); // put 0 in the array of stops to keep the count consistent
		if(newArray[k].toLowerCase().includes("rgb") && newArray[k].substr(-1) !== ")") // if the person was using rgba values we would have a problem of missing bracket at the end due to the earlier loop in which we only took 3 values
			newArray[k] = newArray[k]+")"; // we add the closing bracket if it's missing
		newArray[k] = newArray[k].replace("rgba","rgb"); // then we replace all the "rgba" with "rgb"
	} // end loop
	
	for (var s=0; s<stopArray.length; s++) // convert all the strings to floats
		stopArray[s] = parseFloat(stopArray[s]); // floats :D
	
	if(stopArray[stopArray.length-1] == 0){ // if the last stop is undefined
		stopArray[stopArray.length-1] = 100; // set the last stop to 100%
		withStop.push(stopArray.length-1); // then add its index to the array of stop indices
	}
	
	// math... it's just taking averages dynamically
	for(var i=0; i<withStop.length; i++){
		var lower = withStop[i-1];
		if(i==0 && stopArray[0]==0) 
			lower = 0;
		var upper = withStop[i];
		var lowerBound = stopArray[lower];
		var upperBound = stopArray[upper];
		for(var j=0; j<=(upper-lower); j++)
			stopArray[lower+j] = lowerBound + j * ((upperBound-lowerBound)/(upper-lower));
	} 
	
	// ok, now it's time to change those nice colours into readable properties
	var dummyDiv = document.createElement("div"); // make a dummy div
	document.body.appendChild(dummyDiv); // add the dummy div to the body so we can style it
	for(var y=0; y<newArray.length; y++){ // run a loop for all the colours
		twoByTwo[y] = []; // make the array a 2D array
		dummyDiv.setAttribute("style","background-color:"+newArray[y]+";"); // set bg colour
		newArray[y] = window.getComputedStyle(dummyDiv).getPropertyValue("background-color"); // read bg colour
		splitColour(newArray[y],twoByTwo[y]); // then we split the colours into rgb with the function, save to array
	} // end loop
	document.body.removeChild(dummyDiv); // remove the dummy div from the DOM when we're done
	
	// in case i fucked up somewhere along the way
	if(twoByTwo.length != stopArray.length){
		console.log("error!");
		return false;
	}
	
	// save the stops and colours into a large-ass array
	for(var z=0; z<twoByTwo.length && z<stopArray.length; z++)
		colourSet[z] = [stopArray[z],twoByTwo[z]]
	
	// run the calculator
	var outputArray = calcGradient(colourSet,randomNumber);
	return outputArray.join(); // return a string of 3 numbers
}

/* check if person has passed an object, ID, class or just a tag name */
/* 
	object: idk what i'm doing tbh
	id: standard, save the only div returned as the colourDiv variable
	class and tag: save the first div in the matched set as the colourDiv
*/
/* define a function checkVariableType(selector) to check what the user has passed to the function (1 argument, can be either string or object) */
function checkVariableType(selector){
	var returnValue; // define a new variable so we know what to return
	switch(typeof selector){ // check if the selector is a string or object
		case 'string': // if the selector is a string
			// check what the string is: id, class, tag?
			// for combination selectors (e.g. div#name.class):
			// id > class > tag, so the function reads the ID first
			if(selector.indexOf("#") > -1) // if string is ID
				returnValue = document.getElementById(selector.split("#").pop()); // return the DOM element by using getElementById with the # removed from the selector string
			else if (selector.indexOf(".") > -1) // if string is class
				returnValue = document.getElementsByClassName(selector.split(".").pop())[0]; // return the first DOM element in the set of elements with the matching class
			else // if selector is a tag
				returnValue = document.getElementsByTagName(selector)[0]; // return the first DOM element in the set of tagged elements
			break; // end case for strings
		case 'object': // if an object has been passed to the function
			// let's define a teeny new function to check what type of object the selector is
			function checkObjectType(object){ // pass the object to the function as an argument
				if(object.length !== undefined) // check the length
					return object[0]; // if object has a length return the first one in the set
				else // otherwise
					return object; // return the object itself
			} // end the function
			// if there is no jquery, there will be no jquery object; also need jquery to check for instanceof jQuery
			if(window.jQuery){  // check for jquery
				if(selector instanceof jQuery) // check if object is jq obj
					returnValue = selector[0]; // if yes, dereference
				else // if not jquery object
					returnValue = checkObjectType(selector); // treat as regular js object and run the checktype function
			} // end if window.jquery
			else // if no jquery found
				returnValue = checkObjectType(selector); // obj is regular js object, run checktype function
			break; // end case for objects
		default: // default case: what the fuck are u doing mate
			console.log("Invalid selector!"); // alert the person that they fucked up
			return 3; // end the function
	}
	return returnValue; // returnValue: an object we can check the style of
}

/* splits the raw rgb colour into its red, blue and green parts */
/*
	splitColour function: splits colour into R,G,B parts and saves to array
	2 arguments: the original colour, the array to save it into
*/
function splitColour(rgb, colourStorage) {
	var c = (rgb.slice(rgb.indexOf('(')+1, rgb.indexOf(')'))).split(','); // slice off the "rgb" and the brackets from the value, then split them into their 3 values and save them as a new array
	// run a loop to convert everything into number variables instead of strings
	for(var k=0; k<c.length; k++){ // set counter k
		if(k<3) // for the first 3 rgb values
			c[k] = parseInt(c[k],10); // change to integers
		else // for the alpha value, if provided
			c[k] = parseFloat(c[k]); // change to float
	}
	// run a loop for each value (R G and B) in the array, to save it to the one outside the scope (the array that we passed to the function)
	for(var i=0; i<c.length; i++)
		colourStorage[i] = c[i]; // save the red, green and blue values into the array we declared earlier
	if(colourStorage.length > 3) // if rgba value given, chop off the alpha part
		colourStorage = colourStorage.slice(0,3);
} // end of splitcolour function

// time to get our rainbow colours yayyy
function calcGradient(gradient,random) {
    var colourRange = []; // a new array for the two colours we'll choose
    var stop = random*100; // get the random number (0-1) as a percentage
	if(gradient[0][0] != 0) // if the first colour doesn't start at 0
		gradient[0][0] = 0; // start it at 0 (otherwise it becomes white) 
	// run a loop to check where our percentage lies in the gradient bar
    for(var i=0; i<gradient.length-1; i++){
		// add the two closest colour stops into the range array
    	if(gradient[i][0] <= stop && stop <= gradient[i+1][0]){
           	colourRange.push(gradient[i],gradient[i+1]);
            break; // exit the loop once added
        }
    }
	// if the array is empty after the loop is done
	if (!Array.isArray(colourRange) || !colourRange.length) {
	  	colourRange.push(gradient[i-1],gradient[i]); // add the last 2 colours
	}
    var firstcolour = colourRange[0][1]; // the first colour (array)
    var secondcolour = colourRange[1][1]; // the second colour (array)
    var firstcolour_x = colourRange[0][0]; // the first colour's position
    var secondcolour_x = colourRange[1][0]-firstcolour_x; // second colour's position
    var ratio = (stop-firstcolour_x)/secondcolour_x; // getting position of our random number relative to both colours
    var result = mixGradient(secondcolour,firstcolour,ratio); // run the mixer function
	return result; // return the mixed colour
}

/* thanks to the folks over at less for the colour mixing function */
/* http://lesscss.org/functions/#color-operations-mix */
function mixGradient(color1, color2, weight) {
    var p = weight;
    var w = p * 2 - 1;
    var w1 = (w/1+1) / 2;
    var w2 = 1 - w1;
    var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)];
    return rgb;
}