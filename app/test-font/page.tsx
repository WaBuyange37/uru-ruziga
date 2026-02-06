'use client'

// Create this file: app/test-font/page.tsx
// Access at: http://localhost:3000/test-font

export default function TestFontPage() {
  return (
    <div className="min-h-screen bg-[#F3E5AB] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-[#8B4513] mb-8">
          Umwero Font Test Page
        </h1>

        {/* Test 1: Direct font-family style */}
        <div className="bg-white p-6 rounded-lg border-2 border-[#8B4513]">
          <h2 className="text-xl font-bold text-[#8B4513] mb-4">
            Test 1: Direct Inline Style
          </h2>
          <div 
            style={{ 
              fontFamily: "'UMWEROalpha', serif",
              fontSize: '48px',
              color: '#8B4513'
            }}
          >
            Test: amazi (should show: "M"Z)
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Latin: amazi | Umwero: "M"Z | Meaning: water
          </p>
        </div>

        {/* Test 2: Using CSS class */}
        <div className="bg-white p-6 rounded-lg border-2 border-[#8B4513]">
          <h2 className="text-xl font-bold text-[#8B4513] mb-4">
            Test 2: Using .font-umwero Class
          </h2>
          <div className="font-umwero text-6xl text-[#8B4513]">
            Test: ubuntu (should show: :A:NT:)
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Latin: ubuntu | Umwero: :A:NT: | Meaning: humanity
          </p>
        </div>

        {/* Test 3: All vowels */}
        <div className="bg-white p-6 rounded-lg border-2 border-[#8B4513]">
          <h2 className="text-xl font-bold text-[#8B4513] mb-4">
            Test 3: All Vowels
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {[
              { latin: 'a', umwero: '"' },
              { latin: 'e', umwero: '|' },
              { latin: 'i', umwero: '}' },
              { latin: 'o', umwero: '{' },
              { latin: 'u', umwero: ':' },
            ].map((vowel) => (
              <div key={vowel.latin} className="text-center p-4 bg-[#F3E5AB] rounded">
                <div 
                  className="text-6xl mb-2"
                  style={{ fontFamily: "'UMWEROalpha', serif" }}
                >
                  {vowel.umwero}
                </div>
                <p className="text-sm text-[#8B4513] font-bold">{vowel.latin}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Test 4: Check if font file is loading */}
        <div className="bg-white p-6 rounded-lg border-2 border-[#8B4513]">
          <h2 className="text-xl font-bold text-[#8B4513] mb-4">
            Test 4: Font Loading Check
          </h2>
          <div className="space-y-2">
            <p className="text-sm">
              If you see the Umwero characters above, the font is working! ✅
            </p>
            <p className="text-sm">
              If you see curly braces like {['{', '}', '"', ':', '|'].join(', ')}, the font is NOT loading ❌
            </p>
            <p className="text-sm font-bold text-red-600">
              Current status: Check the characters above
            </p>
          </div>
        </div>

        {/* Troubleshooting Guide */}
        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-400">
          <h2 className="text-xl font-bold text-yellow-800 mb-4">
            🔧 Troubleshooting
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-bold">If font is not loading:</p>
              <ol className="list-decimal list-inside ml-4 mt-2 space-y-1">
                <li>Check that <code className="bg-yellow-100 px-1">public/fonts/Umwero.ttf</code> exists</li>
                <li>Open browser DevTools (F12) → Network tab</li>
                <li>Refresh page and look for "Umwero.ttf" in requests</li>
                <li>If it shows 404, the font path is wrong</li>
                <li>Try moving font to <code className="bg-yellow-100 px-1">public/Umwero.ttf</code> (root of public)</li>
                <li>Update CSS to: <code className="bg-yellow-100 px-1">url('/Umwero.ttf')</code></li>
              </ol>
            </div>
          </div>
        </div>

        {/* Font file locations */}
        <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-400">
          <h2 className="text-xl font-bold text-blue-800 mb-4">
            📁 Expected Font Locations
          </h2>
          <div className="space-y-2 font-mono text-sm">
            <p>✅ Option 1: <code>public/fonts/Umwero.ttf</code></p>
            <p>✅ Option 2: <code>public/Umwero.ttf</code></p>
            <p className="text-gray-600 mt-4">
              In CSS, use: <code className="bg-blue-100 px-1">url('/fonts/Umwero.ttf')</code> for option 1
            </p>
            <p className="text-gray-600">
              Or: <code className="bg-blue-100 px-1">url('/Umwero.ttf')</code> for option 2
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}