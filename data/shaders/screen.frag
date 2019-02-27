#version 330

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_screen_texture;
uniform int u_postpo_mode;
uniform vec3 u_postpo_rgb;
uniform vec3 u_postpo_gnd;
uniform vec3 u_postpo_tbp;

const int indexMatrix4x4[16] = int[](0,  8,  2,  10,
                                     12, 4,  14, 6,
                                     3,  11, 1,  9,
                                     15, 7,  13, 5);
const int indexMatrix8x8[64] = int[](0,  32, 8,  40, 2,  34, 10, 42,
                                     48, 16, 56, 24, 50, 18, 58, 26,
                                     12, 44, 4,  36, 14, 46, 6,  38,
                                     60, 28, 52, 20, 62, 30, 54, 22,
                                     3,  35, 11, 43, 1,  33, 9,  41,
                                     51, 19, 59, 27, 49, 17, 57, 25,
                                     15, 47, 7,  39, 13, 45, 5,  37,
                                     63, 31, 55, 23, 61, 29, 53, 21);

float indexValue(float option) {
	int x,y;
	if(option == 4.0){
	    x = int(mod(gl_FragCoord.x, 4));
	    y = int(mod(gl_FragCoord.y, 4));
	    return indexMatrix4x4[(x + y * 4)] / 16.0;		
	}else{
	    x = int(mod(gl_FragCoord.x, 8));
	    y = int(mod(gl_FragCoord.y, 8));
	    return indexMatrix8x8[(x + y * 8)] / 64.0;
	}
}

float dither(float color, float option) {
    float closestColor = (color < 0.5) ? 0 : 1;
    float secondClosestColor = 1 - closestColor;
    float d = indexValue(option);
    float distance = abs(closestColor - color);
    return (distance < d) ? closestColor : secondClosestColor;
}

void main(){

	vec3 col = texture(u_screen_texture, v_uv).xyz;
	switch(u_postpo_mode){
		case 0: //Normal
			col = col;
			break;
		case 1: //B&W FX		
			float a = 0.2126 * col.r + 0.7152 * col.g + 0.0722 * col.b;
	    	col = vec3(a,a,a);
			break;
		case 2: //Color grading FX
			float r = u_postpo_rgb.x * col.r;
			float g = u_postpo_rgb.y * col.g;
			float b = u_postpo_rgb.z * col.b;
	    	col = vec3(r,g,b);
			break;
		case 3:  // Posterize FX
		  	col = pow(col, vec3(u_postpo_gnd.x));
		  	col = col * u_postpo_gnd.y;
		  	col = floor(col);
		  	col = col / u_postpo_gnd.y;
		  	col = pow(col, vec3(1.0/u_postpo_gnd.x));
			break;
		case 4: //Dithering FX
	    	col = vec3(	dither(col.x, u_postpo_gnd.z),
	    				dither(col.y, u_postpo_gnd.z),
	    				dither(col.z, u_postpo_gnd.z));
	    	break;
    	case 5: //Threshold
			float bright = u_postpo_tbp.y * (col.r + col.g + col.b);
			float th = mix(0.0, 1.0, step(u_postpo_tbp.x, bright));
			col = vec3(th);
	    	break;
		case 6: //Invert
			col = vec3(1.0) - col;
			break;
		case 7: //Pixelize
			vec2 pixels = vec2(u_postpo_tbp.z,u_postpo_tbp.z);
		  	vec2 p = v_uv;
			p.x -= mod(p.x, 1.0 / pixels.x);
			p.y -= mod(p.y, 1.0 / pixels.y);
			col = texture2D(u_screen_texture, p).rgb;
			break;
	}

    fragColor = vec4(col,1.0);

}