import React, { useState } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [imgSrc, setImgSrc] = useState(null);
  const [faviconB64, setFaviconB64] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [useCuda, setUseCuda] = useState(false);
  const [resolution, setResolution] = useState('64');
  const [steps, setSteps] = useState('20');
  const [format, setFormat] = useState('jpeg');

  const generateIcon = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          use_cuda: useCuda,
          resolution: parseInt(resolution),
          steps: parseInt(steps),
          format
        }),
      });
      if (!response.ok) {
        throw new Error('API request failed');
      }
      const data = await response.json();
      const mimeType = format === 'jpeg' ? 'jpeg' : 'png';
      setImgSrc(`data:image/${mimeType};base64,${data.image}`);
      setFaviconB64(data.favicon ? data.favicon : null); 
    } catch (error) {
      console.error('Error generating icon:', error);
      setImgSrc(null);
      setFaviconB64(null);
    } finally {
      setLoading(false);
    }
  };

  function downloadFavicon(base64String) {
    const byteString = atob(base64String);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([intArray], { type: 'image/x-icon' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'favicon.ico';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="App">
      <div className="HeaderBar">
        <h1>Cool Icon Maker</h1>
      </div>
      <div className="content">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter prompt"
        />
        <div>
          <label>
            <input
              type="checkbox"
              checked={useCuda}
              onChange={(e) => setUseCuda(e.target.checked)}
            />{' '}
            Enable GPU acceleration
          </label>
        </div>
        <div>
          <label>Resolution (pixels): </label>
          <select value={resolution} onChange={(e) => setResolution(e.target.value)}>
            <option value="64">64x64</option>
            <option value="512">512x512</option>
          </select>
        </div>
        <div>
          <label>Inference steps:</label>
          <select value={steps} onChange={(e) => setSteps(e.target.value)}>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
        <div>
          <label>File format: </label>
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
          </select>
        </div>
        <button onClick={generateIcon} disabled={loading} className="blue-button">
          {loading ? 'Generating...' : 'Generate'}
        </button>
        {imgSrc && (
          <div>
            <h2>Result:</h2>
            <img src={imgSrc} alt="Generated icon" style={{ maxWidth: '256px' }} />
            <br />
            <button
              className="blue-button download-button"
              onClick={() => {
                const arr = imgSrc.split(',');
                const mime = arr[0].match(/:(.*?);/)[1];
                const bstr = atob(arr[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) {
                  u8arr[n] = bstr.charCodeAt(n);
                }
                const blob = new Blob([u8arr], { type: mime });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `icon.${format}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
            >
              Download Icon
            </button>
            <br />
            {faviconB64 && (
              <>
                <br />
                <button
                  className="blue-button download-button"
                  onClick={() => downloadFavicon(faviconB64)}
                  style={{ marginTop: 8 }}
                >
                  Download Favicon (.ico)
                </button>
              </>
            )}
           </div>
        )}
      </div>
    </div>
  );
}

export default App;
