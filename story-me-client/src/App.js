import logo from './logo.svg';
import React, { useState } from 'react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState();
  const [isFetchingImageDesc, setIsFetchingImageDesc] = useState(false);
  const [isFetchingStory, setIsFetchingStory] = useState(false);
  const [imageDescriptions, setImageDescriptions] = useState([]);

  const changeHandler = (event) => {
    setSelectedFile(event.target.files);
  };

  const handleSubmission = () => {
    setIsFetchingImageDesc(true);
    const formData = new FormData();
    Array.from(selectedFile).forEach((file) => {
      formData.append('file', file);
    });

    fetch(
      'http://127.0.0.1:8000/upload/',
      {
        method: 'POST',
        body: formData
      }
    )
      .then((response) => response.json())
      .then((result) => {
        const { images } = result;
        if (images) {
          setImageDescriptions(images);
          setIsFetchingStory(true);
        } else {
          alert("Image To Text Failed. Check Console.");
          console.log(result);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div>
      <h1>Story.Me</h1>
      {
        !isFetchingImageDesc ? (
          <input type="file" name="file" onChange={changeHandler} accept=".png,.jpg,.jpeg" multiple />
        ) : null
      }
      <div>
        <button onClick={handleSubmission}>Submit</button>
      </div>
    </div>
  )
}

export default App;
