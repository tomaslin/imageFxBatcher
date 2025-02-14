# imageFxBatcher
Runs calls to google's imagefx in batch

First, edit the script to run it in non-headless mode so you can create the chrome profile and login to your google account

Change 

   `browser = await puppeteer.launch({ 
          headless: "new",
          executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          userDataDir: path.join(process.cwd(), 'chrome-profile')
   });`

to `headless : false, keepAlive: true, `

Run the script so the chrome window opens and you can login to your profile.

Change it back.

Generate a new file, prompts.txt at the root, enter one prompt you want to run per line

`A bioluminescent jellyfish pulsating with vibrant neon colors, drifting through the inky black depths of an alien ocean. Tiny, glowing fish scatter as it passes.
A lone astronaut, silhouetted against the swirling, multicolored nebula of a distant galaxy, planting a small, wilting flower in the lunar soil.
A bustling marketplace in a cyberpunk city, with holographic advertisements flickering, steam rising from food stalls, and diverse crowds in futuristic clothing. Rain slicks the neon-lit streets.`

Run `npm start` and it should download these files. You might have to init the node project. Tested on Mac. Provided as is.
