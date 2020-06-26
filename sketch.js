var img;
var mask;
var font;

var combined = [];
var mask_indexes = [];

var ready = false;
var ceiling;
var pos;
var index;

var image_input;
var mask_input;
var save_button;
var cancel_button;
var mask_check;

var sort_select;

function preload(){
	img = loadImage("newtest.png");
	mask = loadImage("mask.png");

	font = loadFont("Helvetica.ttf");
}

function setup(){
	let canv = createCanvas(windowWidth, windowHeight);

	image_input = createFileInput(handle_image);
	mask_input = createFileInput(handle_mask);

	save_button = createButton("save");
	save_button.mousePressed(save_image);
	cancel_button = createButton("cancel sorting");
	cancel_button.mousePressed(cancel_sorting);

	mask_check = createCheckbox('Use mask?', true);

	textFont(font);

	sort_select = createSelect();
	sort_select.option('hue');
	sort_select.option('brightness');
	sort_select.option('saturation');
	sort_select.selected('hue');
}

function draw_ui(){
	image_input.position(0, 0);
	textAlign(LEFT);
	textSize(16);
	text("upload an image", 0, 40);

	mask_input.position(0, 60);
	textAlign(LEFT);
	textSize(16);
	text("upload a mask for sorting", 0, 100);

	mask_check.position(0, 120);

	textAlign(LEFT);
	textSize(16);
	text("choose value to sort by", 0, 175);
	sort_select.position(0, 180);

	textAlign(CENTER);
	if(!ready){
		textSize(30);
		text("press enter to begin", width/2, 90);
	}
	textSize(50);
	text("Pixel Sorter", width/2, 60);

	cancel_button.position(0, 300);
	save_button.position(0, 340);
}

function draw(){
	background(255);
	draw_ui();
	
	if(ready){
		if(index >= 0){
			insort_vis(combined, index);
			index--;
		}
		else{
			ready = false;
			index = 0;
		}

		let cur_pix = 0;
		for(let i = 0; i < combined.length; i++){
			if(mask_check.checked()){
				while(!mask_indexes[cur_pix]){
					cur_pix++;
				}
			}
			img.pixels[cur_pix*4] = combined[i][0];
			img.pixels[cur_pix*4 + 1] = combined[i][1];
			img.pixels[cur_pix*4 + 2] = combined[i][2];
			img.pixels[cur_pix*4 + 3] = combined[i][3];

			cur_pix++;
		}

		img.updatePixels();
	}
	if(img != null){
		scale(4);
		image(img, width/8 - img.width/2, height/8 - img.height/2);
	}
}

function init(){
	img.loadPixels();
	mask.loadPixels();

	for(let i = 0; i < mask.pixels.length; i+=4){
		mask_indexes[i/4] = mask.pixels[i+3] > 0;
	}

	let comb_i = 0;
	for(let i = 0; i < img.pixels.length; i+=4){
		if(!mask_indexes[i/4] && mask_check.checked()){
			continue;
		}
		combined[comb_i] = [img.pixels[i], img.pixels[i+1], img.pixels[i+2], img.pixels[i+3]];
		comb_i++;
	}
	ceiling = combined.length-1;
	pos = ceiling;
	index = combined.length-2;
}

function insort_vis(list, i){
	for(let k = i; k < list.length-1; k++){
		if(compare(list[k+1], list[k])){
			let temp = list[k];
			list[k] = list[k+1];
			list[k+1] = temp;
		}
		else
			break;
		if(k+1 == list.length)
			break;
	}
}

function compare(a, b){
	switch(sort_select.value()){
		case 'hue':
			return rgb2hue(a[0], a[1], a[2]) > rgb2hue(b[0], b[1], b[2]);
			break;
		case 'brightness':
			return (a[0]+a[1]+a[2])/3 > (b[0]+b[1]+b[2])/3;
			break;
		case 'saturation':
			return saturation(color(a[0], a[1], a[2])) > saturation(color(b[0], b[1], b[2]));
			break;
			
	}
}

function rgb2hue(r, g, b){
	r /= 255;
	g /= 255;
	b /= 255;

	let min;
	if(r < g && r < b){
		min = r;
	}
	if(g < r && g < b){
		min = g;
	}
	if(b < r && b < g){
		min = b;
	}

	let result;
	if(r > g && r > b){
		result = 60*((g-b)/(r-min));
	}
	if(g > r && g > b){
		result = 60*(2 + (b-r)/(g-min));
	}
	if(b > r && b > g){
		result = 60*(4 + (r-g)/(b-min));
	}

	result %= 360;
	if(result < 0){
		result += 360;
	}
	return result;
}

function keyPressed(){
	if(keyCode === ENTER){
		init();
		ready = true;
	}
}

function handle_image(file){
	img = loadImage(file.data);
}
function handle_mask(file){
	mask = loadImage(file.data);
}

function save_image(){
	img.save('sorted', 'png');
}

function cancel_sorting(){
	ready = false;
}









function qsort(list){
	qsort_rec(list, 0, list.length-1);
}

function insort(list){
	let ceiling = list.length-1;
	let pos = ceiling;

	for(let i = list.length-2; i >= 0; i--){
		for(let k = i; k < list.length; k++){
			if(compare(list[k+1], list[k])){
				let temp = list[k];
				list[k] = list[k+1];
				list[k+1] = temp;
			}
			else
				break;
			if(k+1 == list.length)
				break;
		}
	}
}

function qsort_rec(list, low, high){
	if(low < high){
		let midpoint = partition(list, low, high);
		
		qsort_rec(list, low, midpoint - 1);
		qsort_rec(list, midpoint + 1, high);
	}
}

function partition(list, low, high){
	let mid = list[high];

	let i = low - 1;

	for(let k = low; k < high; k++){
		if(compare(mid, list[k])){
			i++;
			let temp = list[i];
			list[i] = list[k];
			list[k] = temp;
		}
	}
	let temp = list[i + 1];
	list[i + 1] = list[high];
	list[high] = temp;
	return i + 1;
}


