import React, { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from './logo.png';
import storyImage from './story-writer.png';
import { Button, Col, Container, Form, Row, Navbar, Stack, Spinner, Placeholder } from 'react-bootstrap';
import ImageCarousel from './ImageCarousel';

const { Configuration, OpenAIApi } = require("openai");
const { OPENAI_API_KEY } = require('./config.json');
const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function App() {
  const [selectedFile, setSelectedFile] = useState();
  const [isImageSubmitted, setIsImageSubmitted] = useState(false);
  const [isFetchingImageDesc, setIsFetchingImageDesc] = useState(false);
  const [isFetchingStory, setIsFetchingStory] = useState(false);
  const [imageDescriptions, setImageDescriptions] = useState([]);
  const [story, setStory] = useState('');
  const [title, setTitle] = useState('');
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);


  const changeHandler = (event) => {
    setSelectedFile(event.target.files);
  };

  const handleReset = () => {
    window.location.reload();
  }

  const fetchTitle = async (story) => {
    setIsFetchingTitle(true);
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Generate Title for the given story.\n
                  Story: ${story}\n
                  Title:`,
      temperature: 0,
      max_tokens: 3500,
    });
    setIsFetchingTitle(false);
    setTitle(response.data.choices[0].text.trim());
  }

  const fetchStory = async (images) => {
    setIsFetchingStory(true);
    let imageText = "";
    images.forEach(element => {
      imageText += `"${element}", `
    });
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Given image descriptions, generate a suspenseful story.\n
                  Image Descriptions: ${imageText}\n
                  Story:`,
      temperature: 0,
      max_tokens: 3500,
    });
    setIsFetchingStory(false);
    setStory(response.data.choices[0].text.trim());
    fetchTitle(response.data.choices[0].text.trim())
    import(
      "https://storage.googleapis.com/speechify-api-cdn/speechifyapi.min.mjs"
    ).then(async (speechifyWidget) => {
      const articleRootElement = document.querySelector("#story");

      const widget = speechifyWidget.makeSpeechifyExperience({
        rootElement: articleRootElement,
        useSpeechifyRoot: false,
        maximizeWidget: false
      });
      await widget.mount();
    });
  }

  const handleSubmission = () => {
    setIsFetchingImageDesc(true);
    setIsImageSubmitted(true);
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
          setIsFetchingImageDesc(false);
          fetchStory(images);
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
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>
            <Row>
              <Col>
                <img
                  src={logo}
                  width="60"
                  height="60"
                  className="d-inline-block align-top"
                  alt="Story.Me logo"
                />
              </Col><Col>
                <h1 className="d-inline-block align-top">Story.Me</h1>
              </Col>
            </Row>
          </Navbar.Brand>
        </Container>
      </Navbar>
      <Container>
        <Row>
          <Col>
            {
              selectedFile && (
                <ImageCarousel files={selectedFile} desc={imageDescriptions} />
              )
            }
            {
              !isImageSubmitted ? (
                <>
                  <Row style={!selectedFile ? { marginTop: '25%' } : { marginTop: '10px' }}>
                    <Col>
                      <Form.Group controlId="formFileMultiple" className="mb-3">
                        <Form.Label>Select Images to get started</Form.Label>
                        <Form.Control type="file" name="file" onChange={changeHandler} accept=".png,.jpg,.jpeg" multiple required />
                      </Form.Group>
                    </Col>
                    <Col>
                    </Col>
                  </Row>
                  <Button onClick={handleSubmission} disabled={!selectedFile} style={{ maxWidth: '100px' }}>Submit</Button>
                </>
              ) : null
            }
            {
              isImageSubmitted && isFetchingImageDesc ? (
                <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '15px' }}>
                  <Spinner animation="grow" variant="primary" size="sm" />
                  <p style={{ marginLeft: '10px' }}>Looking at the images...</p>
                </div>
              ) : null
            }
            {
              isImageSubmitted && isFetchingStory ? (
                <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '15px' }}>
                  <Spinner animation="grow" variant="primary" size="sm" />
                  <p style={{ marginLeft: '10px' }}>Writing an interesting story...</p>
                </div>
              ) : null
            }
            {
              isImageSubmitted && isFetchingTitle ? (
                <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '15px' }}>
                  <Spinner animation="grow" variant="primary" size="sm" />
                  <p style={{ marginLeft: '10px' }}>Giving it a title...</p>
                </div>
              ) : null
            }
            {
              title && (<Button variant="secondary" style={{ marginTop: '10px' }} onClick={handleReset}>Reset</Button>)
            }
          </Col>
          <Col>
            {
              story ? (
                <>
                  {
                    title ? (
                      <h3 style={{
                        marginTop: '10px',
                        fontFamily: "'Robato', sans-serif",
                      }}>
                        {title}
                      </h3>
                    ) : (
                      <Placeholder style={{ marginTop: '10px' }} animation="glow">
                        <Placeholder size='lg' className="w-75" as='h3' />
                      </Placeholder>
                    )
                  }
                  <p id="story" style={{
                    border: '0.5px solid',
                    borderRadius: '10px',
                    background: '#f8f8f8',
                    color: '#343a40',
                    marginTop: '10px',
                    marginBottom: '50px',
                    padding: '12px',
                    whiteSpace: 'pre-line',
                    fontFamily: "'Robato', sans-serif",
                    fontSize: '1.02rem',
                    textAlign: 'justify'
                  }} dangerouslySetInnerHTML={{ __html: story }}></p>
                </>
              ) : (
                <img style={{ marginTop: '30px' }} src={storyImage} />
              )
            }
          </Col>
        </Row>
      </Container>
      <Navbar fixed='bottom' bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>
            <Row>
              <p className="d-inline-block">Created by: Viral Damaniya & Shreyash Joshi</p>
            </Row>
          </Navbar.Brand>
        </Container>
      </Navbar>
    </div>
  )
}

export default App;
