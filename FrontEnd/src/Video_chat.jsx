
import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Row, Container, Button} from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './videochat.css'

const Video_Chat = () => {
    let [paired, set_paired] = useState(false);
    
    return(
        <Container>
            <h1> Video streams go here</h1>
            <Row>
                <Col xs={5} >
                    <div className='screen'>

                    </div>
                    <Link to='/'>
                    <Button variant='danger'>
                        Leave
                    </Button>
                    </Link>
                    <Button variant='primary'>
                        Skip
                    </Button>
                </Col>
                <Col xs={2}></Col>
                <Col xs={5}>
                    <div className='screen'>

                    </div>
                    
                </Col>
            </Row>
        </Container>
    )
}

export default Video_Chat