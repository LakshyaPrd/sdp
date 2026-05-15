# Start the Upload Service (Port 3000)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd vercel/vercel-upload-service; npm run dev"

# Start the Request Handler (Port 3001)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd vercel/vercel-request-handler; npm run dev"

Write-Host "Backend services are starting in separate windows..." -ForegroundColor Green
Write-Host "Upload Service: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Request Handler: http://localhost:3001" -ForegroundColor Cyan
