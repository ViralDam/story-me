import Carousel from 'react-bootstrap/Carousel';

function ImageCarousel({ files, desc }) {
    const urls = Array.from(files).map((file, index) => {
        return (
            <Carousel.Item key={index}>
                <img
                    className="d-block w-100"
                    src={URL.createObjectURL(file)}
                    height="400"
                />
                {desc.length !== 0 ? (
                    <Carousel.Caption style={{backgroundColor: '#ffffff77'}}>
                        <p>{desc[index]}</p>
                    </Carousel.Caption>
                ) : null}
            </Carousel.Item >
        )
    })
    return (
        <Carousel variant="dark" style={{marginTop:'10px'}}>
            {urls}
        </Carousel>
    );
}

export default ImageCarousel;