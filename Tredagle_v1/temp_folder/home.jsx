import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Row, Col} from 'react-bootstrap';
import { Link } from 'react-router-dom'

const Home = () => {

    return(
        <div>
            <div>
                <h1 class = "text-3xl font-bold underline">Tredagle</h1>      
            </div>
            <Container>
                <Row>
                    <Col xs={3}></Col>
                    <Col xs={6}>
                        <h1></h1>
                    </Col>
                    <Col xs={3}></Col>
                </Row>
                <Row>
                    <Col xs={3}></Col>
                    <Col xs={6}>
                        <Link to='/chatroom'>
                        <Button variant="primary">Enter</Button>
                        </Link>
                    </Col>
                    <Col xs={3}></Col>
                </Row>
                <Row>
                    <Col>
                    <p>
                        "The button I wish I never pressed"
                    </p>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Home