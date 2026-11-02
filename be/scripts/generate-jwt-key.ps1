$ErrorActionPreference = 'Stop'
$targetDirectory = Join-Path $PSScriptRoot '..\.keys'
New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
$target = Join-Path $targetDirectory 'jwt-private.pem'
if (Test-Path -LiteralPath $target) {
    throw "Private key already exists at $target"
}
$rsa = [System.Security.Cryptography.RSA]::Create(3072)
try {
    [System.IO.File]::WriteAllText($target, $rsa.ExportPkcs8PrivateKeyPem())
    Write-Output "Created private key at $target. Keep this file secret and back it up securely."
} finally {
    $rsa.Dispose()
}
