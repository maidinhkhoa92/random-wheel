import React, { useEffect } from "react";
import { addDoc, collection, where, onSnapshot, query } from "firebase/firestore";

import "./App.css";
import { db } from "./utils"
import { Routes, Route, BrowserRouter } from "react-router-dom";

class App extends React.Component {
  state = {
    name: "",
    list: [
      "1 Larue",
      "1 Apple",
      "1 Lambo",
      "1$",
      "1k",
      "1 trái ổi",
      "1 Lovers",
      "N/A",
    ],
    // list: ["$100", "$500", "$9,999", "$1", "$60", "$1,000", "$4.44"],
    // list: ["$100","$500","$9,999","$1","$60"],
    radius: 75, // PIXELS
    rotate: 0, // DEGREES
    easeOut: 0, // SECONDS
    angle: 0, // RADIANS
    top: null, // INDEX
    offset: null, // RADIANS
    net: null, // RADIANS
    result: null, // INDEX
    spinning: false
  };

  onNameChange = (event) => {
    const value = event.target.value
    this.setState({ name: value })
  }

  componentDidMount() {
    // generate canvas wheel on load
    this.renderWheel();
  }

  renderWheel() {
    // determine number/size of sectors that need to created
    let numOptions = this.state.list.length;
    let arcSize = (2 * Math.PI) / numOptions;
    this.setState({
      angle: arcSize
    });

    // get index of starting position of selector
    this.topPosition(numOptions, arcSize);

    // dynamically generate sectors from state list
    let angle = 0;
    for (let i = 0; i < numOptions; i++) {
      let text = this.state.list[i];
      this.renderSector(i + 1, text, angle, arcSize, this.getColor());
      angle += arcSize;
    }
  }

  topPosition = (num, angle) => {
    // set starting index and angle offset based on list length
    // works upto 9 options
    let topSpot = null;
    let degreesOff = null;
    if (num === 9) {
      topSpot = 7;
      degreesOff = Math.PI / 2 - angle * 2;
    } else if (num === 8) {
      topSpot = 6;
      degreesOff = 0;
    } else if (num <= 7 && num > 4) {
      topSpot = num - 1;
      degreesOff = Math.PI / 2 - angle;
    } else if (num === 4) {
      topSpot = num - 1;
      degreesOff = 0;
    } else if (num <= 3) {
      topSpot = num;
      degreesOff = Math.PI / 2;
    }

    this.setState({
      top: topSpot - 1,
      offset: degreesOff
    });
  };

  renderSector(index, text, start, arc, color) {
    // create canvas arc for each list element
    let canvas = document.getElementById("wheel");
    let ctx = canvas.getContext("2d");
    let x = canvas.width / 2;
    let y = canvas.height / 2;
    let radius = this.state.radius;
    let startAngle = start;
    let endAngle = start + arc;
    let angle = index * arc;
    let baseSize = radius * 3.33;
    let textRadius = baseSize - 150;

    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle, false);
    ctx.lineWidth = radius * 2;
    ctx.strokeStyle = color;

    ctx.font = "14px Arial";
    ctx.fillStyle = "black";
    ctx.stroke();

    ctx.save();
    ctx.translate(
      baseSize + Math.cos(angle - arc / 2) * textRadius,
      baseSize + Math.sin(angle - arc / 2) * textRadius
    );
    ctx.rotate(angle - arc / 2 + Math.PI / 2);
    ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
    ctx.restore();
  }

  getColor() {
    // randomly generate rbg values for wheel sectors
    let r = Math.floor(Math.random() * 255);
    let g = Math.floor(Math.random() * 255);
    let b = Math.floor(Math.random() * 255);
    return `rgba(${r},${g},${b},0.4)`;
  }

  spin = () => {
    // set random spin degree and ease out time
    // set state variables to initiate animation
    let randomSpin = Math.floor(Math.random() * 900) + 500;
    this.setState({
      rotate: randomSpin,
      easeOut: 2,
      spinning: false
    });

    // calcalute result after wheel stops spinning
    setTimeout(() => {
      this.getResult(randomSpin);
    }, 2000);
  };

  getResult = spin => {
    // find net rotation and add to offset angle
    // repeat substraction of inner angle amount from total distance traversed
    // use count as an index to find value of result from state list
    const { angle, top, offset, list } = this.state;
    let netRotation = ((spin % 360) * Math.PI) / 180; // RADIANS
    let travel = netRotation + offset;
    let count = top + 1;
    while (travel > 0) {
      travel = travel - angle;
      count--;
    }
    let result;
    if (count >= 0) {
      result = count;
    } else {
      result = list.length + count;
    }

    // set state variable to display result
    this.setState({
      net: netRotation,
      result: result,
      spinning: true
    }, async () => {
      try {
        const docRef = await addDoc(collection(db, "results"), {
          name: this.state.name,
          result: this.state.list[this.state.result],
          isActive: true
        });
        console.log("Document written with ID: ", docRef.id);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    });
  };

  render() {
    return (
      <div className="App">
        <h1>Chương trình bốc thăm đầu năm</h1>
        <input type="text" name="name" placeholder="Tên của bạn" onChange={this.onNameChange} />

        <div className="random-wrapper">
          <span id="selector">&#9660;</span>
          <canvas
            id="wheel"
            width="500"
            height="500"
            style={{
              WebkitTransform: `rotate(${this.state.rotate}deg)`,
              WebkitTransition: `-webkit-transform ${this.state.easeOut
                }s ease-out`
            }}
          />
        </div>
        {this.state.spinning ? (
          <>
            <div className="display">
              <span id="readout">
                YOU WON:{"  "}
                <span id="result">{this.state.list[this.state.result]}</span>
              </span>
            </div>
          </>
        ) : (
          <>

            <button type="button" id="spin" onClick={this.spin}>
              Quay nào
            </button>
          </>
        )}
      </div>
    );
  }
}

const Result = () => {
  const [list, setList] = React.useState([])

  React.useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "results"), where("isActive", "==", true)), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        setList((prev) => [...prev, change.doc.data()])
      });
    });

    return () => {
      unsub()
    }
  }, [])

  return (
    <table>
      <tr>
        <td>STT</td>
        <td>Tên</td>
        <td>Phần thưởng</td>
      </tr>
      {
        list.map((item, index) => (
          <tr key={index}>
            <td>{index}</td>
            <td>{item.name}</td>
            <td>{item.result}</td>
          </tr>
        ))
      }
    </table>
  )
}

const RoutersPage = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="result" element={<Result />} />
      </Routes>
    </BrowserRouter>
  )
}

export default RoutersPage
