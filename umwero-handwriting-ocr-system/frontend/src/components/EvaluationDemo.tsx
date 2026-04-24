"use client";

import React, { useState, useCallback } from 'react';
import { HandwritingCanvas, createEvaluationRequest } from './HandwritingCanvas';
import { useEvaluationApi, EvaluationResponse, EvaluationApiError } from '../lib/evaluation-api';

interface EvaluationDemoProps {
  defaultCharacter?: string;
}

export const EvaluationDemo: React.FC<EvaluationDemoProps> = ({
  defaultCharacter = 'A'
}) => {
  const [character, setCharacter] = useState(defaultCharacter);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<EvaluationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [exportedImage, setExportedImage] = useState<string | null>(null);

  const { evaluateCharacter, healthCheck } = useEvaluationApi();

  // Handle drawing changes
  const handleDrawingChange = useCallback((hasContent: boolean) => {
    setHasDrawing(hasContent);
    if (!hasContent) {
      setResult(null);
      setError(null);
      setExportedImage(null);
    }
  }, []);

  // Handle canvas export
  const handleExport = useCallback((imageData: string) => {
    setExportedImage(imageData);
    console.log('Exported image data:', imageData.substring(0, 100) + '...');
  }, []);

  // Evaluate the drawing
  const handleEvaluate = useCallback(async () => {
    if (!hasDrawing || !exportedImage) {
      setError('Please draw something first');
      return;
    }

    setIsEvaluating(true);
    setError(null);
    setResult(null);

    try {
      const request = createEvaluationRequest(
        character,
        exportedImage,
        `session_${Date.now()}`,
        'demo_user'
      );

      console.log('Sending evaluation request:', {
        character: request.character,
        imageSize: request.image.length,
        sessionId: request.sessionId
      });

      const response = await evaluateCharacter(request);
      
      console.log('Evaluation response:', response);
      setResult(response);

    } catch (err) {
      console.error('Evaluation error:', err);
      
      if (err instanceof EvaluationApiError) {
        setError(`${err.code}: ${err.message}`);
      } else {
        setError(`Evaluation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } finally {
      setIsEvaluating(false);
    }
  }, [character, exportedImage, hasDrawing, evaluateCharacter]);

  // Test API health
  const handleHealthCheck = useCallback(async () => {
    try {
      const health = await healthCheck();
      alert(`API Health: ${health.status} at ${health.timestamp}`);
    } catch (err) {
      console.error('Health check failed:', err);
      alert(`Health check failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [healthCheck]);

  // Get score color based on value
  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= 70) return '#FF9800'; // Orange
    return '#f44336'; // Red
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Umwero Handwriting Evaluation Demo</h1>
      
      {/* Character Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="character-input" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Character to Practice:
        </label>
        <input
          id="character-input"
          type="text"
          value={character}
          onChange={(e) => setCharacter(e.target.value.slice(0, 1))} // Limit to 1 character
          maxLength={1}
          style={{
            padding: '8px',
            fontSize: '18px',
            border: '2px solid #ccc',
            borderRadius: '4px',
            width: '60px',
            textAlign: 'center'
          }}
          placeholder="A"
        />
      </div>

      {/* Canvas */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Draw the character "{character}" below:</h3>
        <HandwritingCanvas
          width={400}
          height={400}
          strokeWidth={4}
          strokeColor="#000000"
          backgroundColor="#ffffff"
          onDrawingChange={handleDrawingChange}
          onExport={handleExport}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={handleEvaluate}
          disabled={!hasDrawing || isEvaluating}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: (!hasDrawing || isEvaluating) ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (!hasDrawing || isEvaluating) ? 'not-allowed' : 'pointer',
            minWidth: '120px'
          }}
        >
          {isEvaluating ? 'Evaluating...' : 'Evaluate Drawing'}
        </button>

        <button
          onClick={handleHealthCheck}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test API Health
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: '4px',
          color: '#c62828',
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div style={{
          padding: '20px',
          backgroundColor: '#f5f5f5',
          border: '2px solid #ddd',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3>Evaluation Results</h3>
          
          {/* Score */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>Score:</span>
              <span style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: getScoreColor(result.score)
              }}>
                {result.score.toFixed(1)}
              </span>
              <span style={{ fontSize: '18px' }}>/ 100</span>
              <span style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
                backgroundColor: result.passed ? '#4CAF50' : '#f44336',
                color: 'white'
              }}>
                {result.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
              </span>
            </div>
          </div>

          {/* Confidence */}
          <div style={{ marginBottom: '15px' }}>
            <span style={{ fontWeight: 'bold' }}>Confidence: </span>
            <span>{(result.confidence * 100).toFixed(1)}%</span>
          </div>

          {/* Processing Time */}
          <div style={{ marginBottom: '15px' }}>
            <span style={{ fontWeight: 'bold' }}>Processing Time: </span>
            <span>{result.processing_time_ms}ms</span>
          </div>

          {/* Feedback */}
          {result.feedback.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <h4>Feedback:</h4>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {result.feedback.map((feedback, index) => (
                  <li key={index} style={{ marginBottom: '5px' }}>
                    {feedback}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Feedback */}
          {result.detailed_feedback.length > 0 && (
            <div>
              <h4>Detailed Analysis:</h4>
              {result.detailed_feedback.map((item, index) => (
                <div key={index} style={{
                  padding: '10px',
                  margin: '5px 0',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>
                    {item.category} ({item.severity})
                  </div>
                  <div style={{ margin: '5px 0' }}>{item.message}</div>
                  {item.suggestion && (
                    <div style={{ fontStyle: 'italic', color: '#666' }}>
                      💡 {item.suggestion}
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    Confidence: {(item.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Exported Image Preview */}
      {exportedImage && (
        <div style={{ marginTop: '20px' }}>
          <h4>Exported Image (sent to API):</h4>
          <img
            src={exportedImage}
            alt="Exported drawing"
            style={{
              border: '2px solid #ccc',
              borderRadius: '4px',
              maxWidth: '256px',
              maxHeight: '256px'
            }}
          />
        </div>
      )}

      {/* Instructions */}
      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#e3f2fd',
        border: '1px solid #2196F3',
        borderRadius: '4px'
      }}>
        <h4>Instructions:</h4>
        <ol>
          <li>Select a character to practice (default: A)</li>
          <li>Draw the character in the canvas above</li>
          <li>Click "Export" to prepare the image</li>
          <li>Click "Evaluate Drawing" to get your score</li>
          <li>Review the feedback to improve your handwriting</li>
        </ol>
        <p><strong>Scoring:</strong> 70+ = Pass, 90+ = Excellent</p>
      </div>
    </div>
  );
};

export default EvaluationDemo;