yarn build

cd build

git init

echo "# twitchxjs.github.io\n\n> Documentation for twitchx.\n\nThis repo contains the documentation for [twitchx](https://github.com/cursorsdottsx/twitch)."

git add .

git commit -m "docs(*): update documentation"

git branch -M main

git remote add origin https://github.com/twitchxjs/twitchxjs.github.io.git

git push -u origin main --force

cd ..

rm -rf build