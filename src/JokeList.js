import React, { Component } from 'react';
import Joke from './Joke';
import axios from 'axios';
import uuid from 'uuid/v4';
import "./JokeList.css"

export default class JokeList extends Component {
  static defaultProps = {
    numJokesToGet: 10
  };
  constructor(props) {
    super(props);
    //pega as piadas do localstorage ou retorna um array vazio
    this.state = { jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]") };
    this.handleClick = this.handleClick.bind(this);
  }
  async componentDidMount() {
    if(this.state.jokes.length === 0) this.getJokes();
  }
  async getJokes() {
    let jokes = [];
    //faz o fetch e preenche o array com piadas
    while(jokes.length < this.props.numJokesToGet) {
      let res = await axios.get("https://icanhazdadjoke.com/", {
        headers: {Accept: "application/json"}
      });
      jokes.push({ id: uuid(), text: res.data.joke, votes: 0 })
    }
    this.setState(st => ({
      jokes: [...st.jokes, ...jokes]
    }),
    () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes)));
    //guarda no local storage as piadas e converte para string
    window.localStorage.setItem(
      "jokes",
      JSON.stringify(jokes)
    );
  }
  handleVote(id, delta) {
    this.setState(
      st => ({
        jokes: st.jokes.map(j =>
          j.id === id ? { ...j, votes: j.votes + delta } : j)
      }),
      //resolve o bug de localstorage dos votos
      () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    )
  }
  handleClick() {
    this.getJokes();
  }

  render() {
    return (
      <div className="JokeList">
        <div className="JokeList-sidebar">
          <h1 className="JokeList-title"><span>Dad</span> Jokes</h1>
          <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" />
          <button className="JokeList-getMore" onClick={this.handleClick()}>New Jokes</button>
        </div>

        <div className="JokeList-jokes">
          {this.state.jokes.map(j => (
            <Joke 
              key={j.id} 
              votes={j.votes} 
              text={j.text} 
              upvote={() => this.handleVote(j.id, 1)}
              downvote={() => this.handleVote(j.id, -1)}
            />
          ))}
        </div>
      </div>
    )
  }
}
