echo "[START] Post Create Command"

sudo chown -R node:node node_modules

bun install

echo "-----------------------------------------------"
echo "git config --global user.name \"Your Name\""
echo "git config --global user.email \"Your Email\""
echo "-----------------------------------------------"

echo "[END] Post Create Command"