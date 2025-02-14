const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

async function generateImages() {
    // Read prompts from file
    const prompts = await fs.readFile('prompts.txt', 'utf-8');
    const promptLines = prompts.split('\n').filter(line => line.trim() !== '');

    // Create timestamp-based directory once at the start
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseOutputDir = path.join('output', timestamp);
    await fs.ensureDir(baseOutputDir);

    // Process each prompt
    for (let promptIndex = 0; promptIndex < promptLines.length; promptIndex++) {
      let browser;
      try {
   
        const prompt = promptLines[promptIndex];
        console.log(`Processing prompt ${promptIndex + 1}: ${prompt}`);
        
        // Launch new browser instance for each prompt
        browser = await puppeteer.launch({ 
          headless: false,
          executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          userDataDir: path.join(process.cwd(), 'chrome-profile')
        });
        
        const page = await browser.newPage();
        await page.setViewport({
          width: 1920,
          height: 1080
        });
        await page.goto('https://labs.google/fx/tools/image-fx');

        // Create prompt-specific subdirectory
        const promptDir = path.join(baseOutputDir, `prompt_${promptIndex + 1}`);
        await fs.ensureDir(promptDir);

        // Input prompt
        await page.waitForSelector('[data-slate-editor="true"]');
        await page.click('[data-slate-editor="true"]');
        await page.keyboard.type(prompt);
        await page.keyboard.press('Enter');

        // Wait for generation to complete (wait for Create button to be clickable again)
        // Wait for generation to complete
        await page.waitForFunction(
          () => {
            const button = Array.from(document.querySelectorAll('button')).find(
              btn => btn.textContent.includes('Create') && !btn.disabled
            );
            return button !== undefined;
          },
          { timeout: 60000 }
        );
        
        // Wait longer for images to load
        await new Promise((resolve) => {
          setTimeout(resolve, 2000);
        });
        
        // Additional check to ensure images are loaded
        await page.waitForFunction(
          () => {
            const images = document.querySelectorAll('img[alt="A generated image based on your input prompt"]');
            return images.length > 0;
          },
          { timeout: 60000 }
        );
        
        const images = await page.evaluate(() => {
          const imgElements = Array.from(document.querySelectorAll('img[alt="A generated image based on your input prompt"]'));
          // Use Set to deduplicate image URLs
          const uniqueUrls = new Set(
            imgElements.map(img => img.src)
          );
          return Array.from(uniqueUrls);
        });
        
        console.log(`Found ${images.length} unique images`);

        // Download each image
        for (let i = 0; i < images.length; i++) {
          const src = images[i];
          
          // Use node-fetch for downloading images
          const nodeFetch = (await import('node-fetch')).default;
          const response = await nodeFetch(src);
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          await fs.writeFile(
            path.join(promptDir, `${i + 1}.png`),
            buffer
          );
        }

      } catch (error) {
        console.error(`Error processing prompt ${promptIndex + 1}:`, error);
      } finally {
        if (browser) {
          await browser.close();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    console.log('Image generation completed');
}

generateImages();