import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';

import api from '../../services/api';

import Container from '../../components/Container';
import { Form, List, SubmitButton } from './styles';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: false,
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => this.setState({ newRepo: e.target.value });

  handleSubmit = async e => {
    e.preventDefault();

    this.setState({ loading: true });

    const { newRepo, repositories } = this.state;

    try {
      const checkRepo = repositories.some(repo => repo.name === newRepo);
      if (checkRepo) throw new Error('Repositorio Duplicado');

      const response = await api.get(`repos/${newRepo}`);
      const data = {
        name: response.data.full_name,
      };
      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: false,
        error: false,
      });
    } catch (error) {
      this.setState({ loading: false, error: true });
    }
  };

  render() {
    const { newRepo, loading, repositories, error } = this.state;
    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit} error={error}>
          <input
            type="text"
            placeholder="Adicionar repositório"
            value={newRepo}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading.toString()}>
            {loading ? (
              <FaSpinner color="#fff" size={14} />
            ) : (
              <FaPlus color="#fff" size={14} />
            )}
          </SubmitButton>
        </Form>

        <List>
          {repositories.map(({ name }) => (
            <li key={name}>
              <span>{name}</span>
              <Link to={`/repository/${encodeURIComponent(name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
