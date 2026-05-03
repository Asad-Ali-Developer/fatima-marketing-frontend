FROM node:24.15-alpine3.22

# Create non-root user
RUN addgroup -S app && adduser -S -G app app

# Working directory (as app user - owned by app:app) (We can check by: ls -l in the terminal or pwd)
WORKDIR /app


# Copy package files in both ways
# COPY package.json package-lock.json ./ 
COPY package*.json ./

# Install dependencies AS ROOT first - (RUN is the build time command or instruction)
RUN npm install

# Copy app files
# COPY . .

# ✅ With this single fast line:
COPY --chown=app:app . .

# 🔥 FIX: Give app user ownership BEFORE switching users
# Step 7: Fix permissions
RUN chown -R app:app /app         


# Create data directory (as app user - owned by app:app
# RUN mkdir -p /app/data && chown -R app:app /app/data

# Switch to non-root user
USER app

# Environment variables
# ENV PORT=3000
# ENV NODE_ENV=development

EXPOSE 3000

# Command Shell Form
# CMD npm start

# Build the app (Specific for Next.js)
RUN npm run build

# ENTRYPOINT ["npm", "start"] # This will override CMD if both are present

# Command Execution Form (According to Mosh, Always use the Execution Form AND Mosh personally prefers this)
CMD ["npm", "start"]