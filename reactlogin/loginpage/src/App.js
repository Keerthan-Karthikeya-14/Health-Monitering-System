import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
    <div>
      <label htmlFor="firstname">First name : </label>
      <input type="text" id="firstname" name="firstname" placeholder="firstname" />
      <br />
      <br></br>
      <label htmlFor="lastname">Last name : </label>
      <input type="text" id="lastname" name="lastname" placeholder="lastname"/>
      
    </div>
    </div>
  );
}

export default App;
