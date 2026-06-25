# Read translations.js as UTF-8
$code = [System.IO.File]::ReadAllText("translations.js", [System.Text.Encoding]::UTF8)

# Let's check if translations is valid by extracting it
# We search for "const translations = {" and matching closing brace
# But a simpler way: since translations.js is valid JS, let's write a small PowerShell script
# that uses the JScript engine via COM or HTML Document to parse it!
# Yes, a headless HTML document in PowerShell can execute JS!

$htmlDoc = New-Object -ComObject "HTMLFile"
$htmlDoc.write("<script>$code</script>")
$window = $htmlDoc.parentWindow

# Check if translations and translatedTerms are defined in the document window
$transType = $window.eval("typeof translations")
$termsType = $window.eval("typeof translatedTerms")

Write-Host "translations type in HTML: $transType"
Write-Host "translatedTerms type in HTML: $termsType"

if ($termsType -eq "object") {
    $keys = $window.eval("Object.keys(translatedTerms).join(',')")
    Write-Host "translatedTerms categories: $keys"
    
    $continents = $window.eval("Object.keys(translatedTerms.continents).join(',')")
    Write-Host "translatedTerms.continents keys: $continents"
    
    # Test translateTerm-like logic
    $window.eval("var currentLang = 'en';")
    $window.eval(@"
function translateTerm(category, term) {
    if (typeof translatedTerms !== 'undefined' && translatedTerms[category] && translatedTerms[category][term]) {
        var mapping = translatedTerms[category][term];
        return mapping[currentLang] || mapping['pt'] || term;
    }
    return term;
}
"@)
    $res1 = $window.eval("translateTerm('continents', 'América do Norte')")
    $res2 = $window.eval("translateTerm('countries', 'Estados Unidos')")
    $res3 = $window.eval("translateTerm('positions', 'Zagueiro')")
    
    Write-Host "Test América do Norte: $res1"
    Write-Host "Test Estados Unidos: $res2"
    Write-Host "Test Zagueiro: $res3"
}
