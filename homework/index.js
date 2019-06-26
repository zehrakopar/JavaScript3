'use strict';

{
  function fetchJSON(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.responseType = 'json';
      xhr.onload = () => {
        if (xhr.status < 400) {
          resolve(xhr.response);
        } else {
          reject(new Error(`Network error: ${xhr.status} - ${xhr.statusText}`));
        }
      };
      xhr.onerror = () => reject(new Error('Network request failed'));
      xhr.send();
    });
  }
  function createAndAppend(name, parent, options = {}) {
    const elem = document.createElement(name);
    parent.appendChild(elem);
    Object.keys(options).forEach(key => {
      const value = options[key];
      if (key === 'text') {
        elem.textContent = value;
      } else {
        elem.setAttribute(key, value);
      }
    });
    return elem;
  }

  function reposAbstract(index, data) {
    const repo = data[index];
    const leftDiv = document.querySelector('.leftDiv');
    const table = createAndAppend('table', leftDiv, { class: 'table' });
    const tBody = createAndAppend('tbody', table);
    const repositoryRow = createAndAppend('tr', tBody, { class: 'row' });
    createAndAppend('td', repositoryRow, { text: 'Repository :', class: 'label' });
    const repositoryRowSecondTd = createAndAppend('td', repositoryRow);
    createAndAppend('a', repositoryRowSecondTd, {
      href: repo.html_url,
      target: '_blank',
      text: repo.name,
    });
    function appendRow(parent, text1, text2) {
      const tr = createAndAppend('tr', parent, { class: 'row' });
      createAndAppend('td', tr, { text: text1, class: 'label' });
      createAndAppend('td', tr, { text: text2 });
    }
    if (repo.description !== null) {
      appendRow(tBody, 'Description :', repo.description);
    }
    appendRow(tBody, 'Forks :', repo.forks);
    appendRow(tBody, 'Updated :', new Date(repo.updated_at).toLocaleString());
  }

  function reposContributor(url) {
    const root = document.getElementById('root');
    const rightDiv = document.querySelector('.rightDiv');
    createAndAppend('p', rightDiv, {
      class: 'contributor-header',
      text: 'Contributions',
    });
    const ul = createAndAppend('ul', rightDiv, { class: 'contributor-list' });

    fetchJSON(url)
      .then(contributors => {
        contributors.forEach(contributor => {
          const li = createAndAppend('li', ul, {
            class: 'contributor-item',
            tabindex: '0',
            'aria-label': contributor.login,
          });

          createAndAppend('img', li, {
            src: contributor.avatar_url,
            height: 48,
            class: 'contributor-avatar',
            alt: 'contributor-avatar',
          });
          const contributorData = createAndAppend('div', li, { class: 'contributor-data' });
          createAndAppend('div', contributorData, { text: contributor.login });
          createAndAppend('div', contributorData, {
            class: 'contributor-badge',
            text: contributor.contributions,
          });

          li.addEventListener('click', () => {
            window.open(contributor.html_url);
          });
        });
      })
      .catch(err => {
        createAndAppend('p', root, { text: err.message, class: 'alert' });
      });
  }

  function main(url) {
    const root = document.getElementById('root');
    const header = createAndAppend('header', root, { class: 'header' });
    createAndAppend('p', header, { text: 'HYF Repositories' });
    const selector = createAndAppend('select', header, { class: 'repo-selector' });

    fetchJSON(url)
      .then(repositories => {
        repositories.sort((a, b) => a.name.localeCompare(b.name));
        for (let i = 0; i < repositories.length; i++) {
          createAndAppend('option', selector, { text: repositories[i].name, value: i });
        }

        const container = createAndAppend('div', root, { id: 'container' });
        createAndAppend('div', container, { class: 'leftDiv' });
        createAndAppend('div', container, { class: 'rightDiv' });
        reposAbstract(selector.value, repositories);
        reposContributor(repositories[selector.value].contributors_url);

        selector.addEventListener('change', () => {
          document.querySelector('.leftDiv').innerHTML = '';
          document.querySelector('.rightDiv').innerHTML = '';
          reposAbstract(selector.value, repositories);
          reposContributor(repositories[selector.value].contributors_url);
        });
      })
      .catch(err => {
        createAndAppend('p', root, { text: err.message, class: 'alert' });
      });
  }

  const HYF_REPOS_URL = 'https://api.github.com/orgs/HackYourFuture/repos?per_page=100';

  window.onload = () => main(HYF_REPOS_URL);
}
