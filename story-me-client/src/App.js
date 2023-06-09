import React, { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from './logo.png';
import storyImage from './story-writer.png';
import { Button, Col, Container, Form, Row, Navbar, Stack, Spinner } from 'react-bootstrap';
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
  const [mood, setMood] = useState('');


  const changeHandler = (event) => {
    const filesList = event.target.files;
    let filesArray = Array.from(filesList);
    filesArray.sort(function (a, b) {
      return ('' + a.name.toLowerCase()).localeCompare(b.name.toLowerCase());
    });
    setSelectedFile(filesArray);
  };

  const handleMood = (newMood) => {
    if (newMood === mood) {
      setMood('');
    }
    else {
      setMood(newMood)
    }
  }

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
    const moodText = mood !== '' ? `Do note that the author of the story is ${mood}.` : '';
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `If we want images to say a story how can we do that? Write an interesting and engaging story from the given image descriptions. Story should be long. Consider following poins when making a story:\n
Give your story strong dramatic content\n
Vary rhythm and structure in your prose\n
Create believable, memorable characters\n
Make the important story sections effective\n
Deepen your plot with subplots\n
Make every line of dialogue count\n
Add what makes a good story (immersive setting)\n
Create conflict and tension\n
Craft beguiling beginnings\n
Deliver knockout endings\n
You can merge the descriptions if meaningful. Story should also be meaningful. ${moodText}\n
Scenarios: ${imageText}\n
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
              (selectedFile && selectedFile.length > 0) && (
                <ImageCarousel files={selectedFile} desc={imageDescriptions} />
              )
            }
            {
              !isImageSubmitted ? (
                <>
                  <Row style={!(selectedFile && selectedFile.length > 0) ? { marginTop: '25%' } : { marginTop: '20px' }}>
                    <Col>
                      <Form.Group controlId="formFileMultiple" className="mb-3">
                        <Form.Label>Select Images to get started</Form.Label>
                        <Form.Control type="file" name="file" onChange={changeHandler} accept=".png,.jpg,.jpeg" multiple required />
                      </Form.Group>
                    </Col>
                    <Col>
                    </Col>
                  </Row>
                  <Form.Group controlId="formFileMultiple">
                    <Form.Label>Select author's mood (optional):</Form.Label>
                  </Form.Group>
                  <Stack direction='horizontal' gap={3}>
                    <div className={mood === 'happy' ? 'emoji-div emoji-active' : 'emoji-div'} onClick={() => handleMood('happy')}><p className='emoji'>😁</p><p className='emoji-text'>Happy</p></div>
                    <div className={mood === 'sad' ? 'emoji-div emoji-active' : 'emoji-div'} onClick={() => handleMood('sad')}><p className='emoji'>😟</p><p className='emoji-text'>Sad</p></div>
                    <div className={mood === 'angry' ? 'emoji-div emoji-active' : 'emoji-div'} onClick={() => handleMood('angry')}><p className='emoji'>😡</p><p className='emoji-text'>Angry</p></div>
                    <div className={mood === 'disgusted' ? 'emoji-div emoji-active' : 'emoji-div'} onClick={() => handleMood('disgusted')}><p className='emoji'>🤢</p><p className='emoji-text'>Disgusted</p></div>
                    <div className={mood === 'shocked' ? 'emoji-div emoji-active' : 'emoji-div'} onClick={() => handleMood('shocked')}><p className='emoji'>😱</p><p className='emoji-text'>Shocked</p></div>
                    <div className={mood === 'scared' ? 'emoji-div emoji-active' : 'emoji-div'} onClick={() => handleMood('scared')}><p className='emoji'>🫣</p><p className='emoji-text'>Scared</p></div>
                  </Stack>
                  <Button onClick={handleSubmission} disabled={!selectedFile} className='mt-3' style={{ maxWidth: '100px', marginBottom: '100px', }}>Submit</Button>
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
                        marginTop: '20px',
                        fontFamily: "'Robato', sans-serif",
                      }}>
                        {title}
                      </h3>
                    ) : null
                  }
                  <p id="story" style={{
                    border: '0.5px solid',
                    borderRadius: '10px',
                    background: '#f8f8f8',
                    color: '#343a40',
                    marginTop: '20px',
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
              <p className="d-inline-block">Created by: Viral Damaniya & Shreyas Joshi</p>
            </Row>
          </Navbar.Brand>
        </Container>
      </Navbar>
    </div>
  )
}

export default App;
