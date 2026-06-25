$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:3000/")
try {
    $listener.Start()
    Write-Host "Servidor rodando em http://localhost:3000/"
    
    # Simple loop to handle requests
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response
        
        # Clean up query strings
        $urlPath = $req.Url.AbsolutePath
        if ($urlPath -eq "/") { $urlPath = "/index.html" }
        
        # Build local path (ensure it is safe and under the current directory)
        $cleanPath = $urlPath.Replace("/", [System.IO.Path]::DirectorySeparatorChar)
        if ($cleanPath.StartsWith([System.IO.Path]::DirectorySeparatorChar)) {
            $cleanPath = $cleanPath.Substring(1)
        }
        $filePath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($PSScriptRoot, $cleanPath))
        
        if ($filePath.StartsWith($PSScriptRoot) -and (Test-Path $filePath -PathType Leaf)) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css" { "text/css" }
                ".js" { "text/javascript; charset=utf-8" }
                ".png" { "image/png" }
                ".jpg" { "image/jpeg" }
                ".svg" { "image/svg+xml" }
                default { "application/octet-stream" }
            }
            
            $res.ContentType = $mime
            $res.ContentLength64 = $bytes.Length
            $res.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $res.StatusCode = 404
            $res.ContentType = "text/plain"
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("Arquivo nao encontrado")
            $res.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $res.Close()
    }
} catch {
    Write-Error $_.Exception.Message
} finally {
    $listener.Close()
}
