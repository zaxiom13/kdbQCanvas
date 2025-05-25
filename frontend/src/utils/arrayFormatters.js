import { isFlatPrimitiveArray, calculateArrayStats } from './queryUtils'

export const formatArrayByShape = (flat, dims, depth = 0) => {
  if (!Array.isArray(flat) || dims.length === 0) return flat
  const [size, ...restDims] = dims
  const chunkSize = restDims.reduce((a, b) => a * b, 1)
  let out = []
  for (let i = 0; i < size; i++) {
    const start = i * chunkSize
    const end = start + chunkSize
    const chunk = flat.slice(start, end)
    out.push(restDims.length > 0 ? formatArrayByShape(chunk, restDims, depth + 1) : chunk[0])
  }
  return out
}

export const compactArrayString = (arr) => {
  if (!Array.isArray(arr)) return String(arr)
  if (arr.length === 0) return '[]'
  
  if (arr.every(x => !Array.isArray(x))) {
    return `[${arr.join(', ')}]`
  }
  
  return `[${arr.map(compactArrayString).join(', ')}]`
}

export const formatArrayWithBoxDrawing = (nestedArr, arrayShape) => {
  if (!arrayShape || !arrayShape.dimensions || arrayShape.dimensions.length < 2) {
    return Array.isArray(nestedArr) ? compactArrayString(nestedArr) : String(nestedArr);
  }

  const dims = arrayShape.dimensions;
  let displayLines = [];

  if (dims.length === 2) {
    nestedArr.forEach(rowArray => {
      displayLines.push(rowArray.join(' '));
    });
  } else if (dims.length === 3) {
    const numPages = dims[0];
    const numRowsInPage = dims[1];

    for (let r = 0; r < numRowsInPage; r++) {
      let currentRowStringParts = [];
      for (let p = 0; p < numPages; p++) {
        if (nestedArr[p] && nestedArr[p][r]) {
          currentRowStringParts.push(nestedArr[p][r].join(' '));
        } else {
          currentRowStringParts.push('');
        }
      }
      displayLines.push(currentRowStringParts.join('   '));
    }
  } else {
    return compactArrayString(nestedArr);
  }

  if (displayLines.length === 0 && dims.length > 0) {
    if (dims.length === 2 && dims[0] === 0) return "╭─\n╯";
    if (dims.length === 3 && dims[1] === 0) return "╭─\n╯";
    return compactArrayString(nestedArr);
  } else if (displayLines.length === 0) {
    return compactArrayString(nestedArr);
  }

  const contentWidth = Math.max(0, ...displayLines.map(line => line.length));
  
  let output = ['╭─'];
  displayLines.forEach(line => {
    output.push(`╷ ${line}`);
  });
  
  output.push('╯');
  
  return output.join('\n');
}

export const formatResult = (data, arrayShape, result) => {
  if (data === null || data === undefined) return 'null';
  
  if (result && result.dataType === 'Time') {
    console.log('Formatting time value:', data)
    
    if (typeof data === 'number') {
      try {
        // Try to interpret as milliseconds since midnight
        const hours = Math.floor(data / 3600000);
        const minutes = Math.floor((data % 3600000) / 60000);
        const seconds = Math.floor((data % 60000) / 1000);
        const millis = data % 1000;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(3, '0')}.${millis.toString().padStart(3, '0')}`;
      } catch (err) {
        console.error('Error formatting time:', err);
      }
    }
    return String(data);
  }
  
  if (Array.isArray(data)) {
    const shapeInfoString = arrayShape ? [
      `Dimensions: ${arrayShape.dimensions.join(' × ')}`,
      `Total Elements: ${arrayShape.totalElements}`,
      `Element Type: ${arrayShape.elementType}`,
      arrayShape.isJagged ? '(Jagged Array)' : ''
    ].filter(Boolean).join(' | ') : 'Array (shape unknown)';

    const totalElements = arrayShape?.totalElements || data.length;
    const isLargeArray = totalElements > 100;

    let dataToFormat = data;
    
    if (arrayShape && arrayShape.dimensions && arrayShape.dimensions.length > 1 && 
        isFlatPrimitiveArray(data)) {
      dataToFormat = formatArrayByShape(data, arrayShape.dimensions);
    }

    let formattedArrayString;
    
    if (isLargeArray) {
      const stats = calculateArrayStats(data);
      if (stats) {
        formattedArrayString = `Array Statistics:
Min: ${stats.min}
Max: ${stats.max}
Average: ${stats.avg}
Std Dev: ${stats.stdDev}
Count: ${stats.count}

[Array too large to display all values (${totalElements} elements)]`;
      } else {
        formattedArrayString = `[Large array with ${totalElements} elements - unable to calculate statistics]`;
      }
    } else {
      if (arrayShape && arrayShape.dimensions && arrayShape.dimensions.length >= 2) {
        formattedArrayString = formatArrayWithBoxDrawing(dataToFormat, arrayShape);
      } else {
        formattedArrayString = compactArrayString(dataToFormat); 
      }
    }
    
    return `${shapeInfoString}\n\n${formattedArrayString}`;
  }
  
  if (typeof data === 'object') {
    try {
      return JSON.stringify(data, null, 2)
    } catch (err) {
      console.error('Error stringifying object:', err)
      return String(data)
    }
  }
  
  return String(data);
}
