
import React from 'react';
import ReactDOM from 'react-dom';


var pulser = {
    running: true,
    frameCount: 0,
    fps: 0,
    lastFpsComputeTime: 0,

    start(dispatch) {
        console.log('Starting clock...');
        this.running = true;
        dispatch('resume');

        this.pulse = ()=> {
            dispatch('clock');
            this.frameCount++;

            if (this.frameCount % 10 === 0) {
                this.computeFps();
            }

            if (this.running) {
                this.ref = requestAnimationFrame(this.pulse);
            }
        }
        this.stop = ()=> {
            console.log('Stoping clock...')
            this.running = false;
            cancelAnimationFrame(this.ref);
            dispatch('pause');
        }

        this.ref = requestAnimationFrame(this.pulse);
    },

    computeFps() {
        var now = (new Date()).valueOf();
        var elapsedTime = (now - this.lastFpsComputeTime) / 1000;
        // computed every 10 frames
        this.fps = 10 / elapsedTime;
        this.lastFpsComputeTime = now;
    }
};

var keys = {
    left: false,
    right: false,
    up: false,
    down: false,
}
document.addEventListener('keydown', function(event) {
    switch (event.key) {
        case "ArrowLeft":
            keys.left = true;
            break;
        case "ArrowRight":
            keys.right = true;
            break;
        case "ArrowUp":
            keys.up = true;
            break;
        case "ArrowDown":
            keys.down = true;
            break;
    };
});
document.addEventListener('keyup', function(event) {
    switch (event.key) {
        case "ArrowLeft":
            keys.left = false;
            break;
        case "ArrowRight":
            keys.right = false;
            break;
        case "ArrowUp":
            keys.up = false;
            break;
        case "ArrowDown":
            keys.down = false;
            break;
    };
});


function move(state, delta) {
    var timeFactor = delta / 20;
    return {
        velocity: Math.min(30, state.velocity + state.acceleration * timeFactor),
        direction: state.direction + state.turn * timeFactor,
        x: state.x + state.velocity * timeFactor * Math.sin(state.direction),
        y: state.y + state.velocity * timeFactor * Math.cos(state.direction),
    };
}
function pilote(state, delta) {
    var timeFactor = delta / 20;
    return {
        acceleration: keys.up ? 0.3 : keys.down ? -0.3 : 0,
        turn: keys.left ? .04 : keys.right ? -.04 : 0,
    };
}

function beat(state, action) {
    switch(action) {
        case 'clock':
            var now = (new Date()).valueOf();
            var elapsedTime = now - state.lastClock;
            return {
                ...state,
                ...pilote(state, elapsedTime),
                ...move(state, elapsedTime),
                lastClock: now
            };
        case 'resume':
            return {
                ...state,
                lastClock: (new Date()).valueOf()
            };
    }
    return {...state};
}

function Stage({x, y, direction}) {
    return <React.Fragment>
        <g height={240} width={240} transform={`translate(120 200) rotate(${180 * direction / Math.PI})`}>
            <g transform={`translate(${x} ${y})`}>
                <rect x={-20000} y={-20000} width={40000} height={40000} fill="url(#grid)" />
            </g>
        </g>
        <g transform={`translate(120 200)`}>
            <rect className="bot"   height={20} width={10} x={-5}     y={-5} />
            <rect className="wheel" height={10} width={4}  x={-2}     y={-10} />
            <rect className="wheel" height={10} width={4}  x={-7 - 2} y={4}  />
            <rect className="wheel" height={10} width={4}  x={ 7 - 2} y={4}  />
        </g>
    </React.Fragment>;
}

function App() {
    var [state, dispatch] = React.useReducer(beat, {
        lastClock: (new Date()).valueOf(),
        velocity: 1,
        direction: 0,
        acceleration: 0,
        turn: 0,
        x: 0,
        y: 0
    });

    React.useEffect(()=> {
        if (pulser.running) {
            pulser.start(dispatch);
        }
        return pulser.stop;
    }, []);

    return <div className="container">
        <div className="row perspective">
            <div className="column card" style={{transform: 'rotateY(15deg) translateZ(-35px)'}}>
                <h1 style={{fontSize: 40}}>Bot Driver</h1>
                <p style={{fontSize: 24}}>This is just a test</p>
                <p style={{fontSize: 16}}>Use arrow keys to control vehicule. Left and right for direction, top and down for velocity, no rocket science ;)</p>
                <p style={{fontSize: 12}}><a href="https://github.com/j-san/bot-driver">Github</a></p>
            </div>

            <div className="grow center" style={{pointerEvents: 'none'}}>
                <svg className="card" viewBox="0 0 240 240" style={{transform: `rotateX(${20 + state.velocity * 2}deg) rotateY(${state.turn * state.velocity * 20}deg)`, height: 300, width: 300}}>
                    <defs>
                        <pattern id="smallGrid" width="8" height="8" patternUnits="userSpaceOnUse">
                            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="gray" strokeWidth="0.5"/>
                        </pattern>
                        <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                            <rect width="80" height="80" fill="url(#smallGrid)"/>
                            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="gray" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <Stage x={state.x} y={state.y} direction={state.direction} />
                </svg>
            </div>

            <div className="card" style={{transform: 'rotateY(-15deg) translateZ(-35px)'}}>
                <p>
                    {pulser.frameCount}
                </p>
                <p>
                    fps {pulser.fps.toFixed(1)}
                </p>
                <button onClick={()=> {
                    pulser.running ? pulser.stop() : pulser.start(dispatch)
                }}>{pulser.running ? 'pause' : 'resume'}</button>
                <hr/>
                <p>
                    velocity {state.velocity.toFixed(1)}
                </p>
                <p>
                    acceleration {state.acceleration.toFixed(1)}
                </p>
                <p>
                    direction {state.direction.toFixed(1)}
                </p>
                <p>
                    turn {state.turn}
                </p>
                <p>
                    x {state.x.toFixed(1)} y {state.y.toFixed(1)}
                </p>
            </div>
        </div>
    </div>;
}

ReactDOM.render(<App />, document.getElementById('app'));