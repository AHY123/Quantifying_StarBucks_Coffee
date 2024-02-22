import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		// Add the directory containing your JSON file to the allow list
		fs: {
		  // Ensure to replace '/path/to/your/assets' with the actual path to your assets directory
		  allow: ['/Users/andrewyang/Library/CloudStorage/OneDrive-UCSanDiego/Stuff/UCSD School Documents/DSC/DSC106/Quantifying_StarBucks_Coffee/assets/flare-2.json']
		}
	  }
});
