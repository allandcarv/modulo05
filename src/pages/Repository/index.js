import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, PaginationButtons } from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    filter: 'open',
    page: 1,
    loading: true,
  };

  componentDidMount() {
    this.loadIssues();
  }

  componentDidUpdate(_, prevState) {
    const { filter, page } = this.state;

    if (prevState.filter !== filter || prevState.page !== page) {
      this.loadIssues();
    }
  }

  handleSelectChange = e => {
    this.setState({ filter: e.target.value, loading: true });
  };

  handleButtonClick = e => {
    const { page } = this.state;

    if (e.target.name === 'next') {
      this.setState({ page: page + 1 });
    } else {
      this.setState({ page: page - 1 });
    }
  };

  loadIssues = async () => {
    this.setState({ loading: true });

    const { filter, page } = this.state;
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filter,
          page,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  };

  render() {
    const { repository, issues, loading, filter, page } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueList>
          <select onChange={this.handleSelectChange} value={filter}>
            <option value="all">all</option>
            <option value="open">open</option>
            <option value="closed">closed</option>
          </select>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>

        <PaginationButtons>
          <button
            name="previous"
            type="button"
            disabled={page === 1}
            onClick={this.handleButtonClick}
          >
            Previous
          </button>

          <button name="next" type="button" onClick={this.handleButtonClick}>
            Next
          </button>
        </PaginationButtons>
      </Container>
    );
  }
}
