#version 330

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_screen_texture;
uniform int u_postpo_mode;

//interesting links
//http://alex-charlton.com/posts/Dithering_on_the_GPU/
//https://github.com/hughsk/glsl-dither

void main(){

	float frag_width = 1/800;
	float frag_height = 1/600;
	vec2 mod_uv = v_uv + vec2(frag_width, frag_height);
	vec3 col = texture(u_screen_texture, v_uv).xyz;

	switch(u_postpo_mode){
		case 0:
			//B&W FX
			float a = 0.2126 * col.r + 0.7152 * col.g + 0.0722 * col.b;
	    	col = vec3(a,a,a);
			break;
		case 1:
			//Color grading FX
			float r = 0.2126 * col.r;
			float g = 0.7152 * col.g;
			float b = 0.0722 * col.b;
	    	col = vec3(r,g,b);
			break;
		case 2:
		    // Posterize FX
		    vec3 c = col;
		    float gamma = 0.6f;
		    float numColors = 4.0;
		  	col = pow(col, vec3(gamma, gamma, gamma));
		  	col = col * numColors;
		  	col = floor(col);
		  	col = col / numColors;
		  	col = pow(col, vec3(1.0/gamma));
			break;
		case 3:
			//Dithering FX
			float f = 0.2126 * col.r + 0.7152 * col.g + 0.0722 * col.b;
	    	col = vec3(f,f,f);
			break;
	}

    fragColor = vec4(col,1.0);

}