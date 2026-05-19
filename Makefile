.PHONY: start stop install setup clean db-reset

# Start the full stack (Supabase, Backend, Frontend)
start:
	@echo "Starting Supabase Ultimate Showcase..."
	@echo "1. Starting Supabase locally..."
	npx supabase start
	@echo "2. Starting Spring Boot Backend (in background)..."
	cd backend && ./mvnw spring-boot:run &
	@echo "3. Starting Next.js Frontend..."
	cd frontend && npm run dev

# Stop all services
stop:
	@echo "Stopping all services..."
	npx supabase stop
	-pkill -f spring-boot:run
	@echo "Done."

# Install dependencies
install:
	@echo "Installing Frontend Dependencies..."
	cd frontend && npm install
	@echo "Frontend ready."

# Full setup (Install + DB Migration + Seed)
setup: install
	@echo "Setting up Database..."
	npx supabase start
	npx supabase db reset
	@echo "Setup complete. Run 'make start' to launch the app."

# Reset database to fresh state
db-reset:
	npx supabase db reset

# Clean build artifacts
clean: stop
	cd backend && ./mvnw clean
	cd frontend && rm -rf .next node_modules
