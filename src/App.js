import './App.css';
import Home from "./Home"
import {BrowserRouter,Routes,Route} from "react-router-dom"
import Watch from "./Watch"
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/watch" element={<Watch/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
