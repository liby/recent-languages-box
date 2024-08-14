# Recent Languages Box

> ✨ Inspired by [lang-box](https://github.com/inokawa/lang-box)
> 📌 For more pinned-gist projects, check out: [awesome-pinned-gists](https://github.com/matchai/awesome-pinned-gists)

This project analyzes your recent GitHub commits using the GitHub API and [Linguist](https://github.com/github-linguist/linguist) to display the percentage of each programming language used. It also calculates the number of lines added/removed per language.

## [Preview](https://gist.github.com/liby/914dd217cecdc3bf27960be421c95850)

## Setup Guide

### 1. Create a GitHub Gist

  1. Go to [https://gist.github.com/](https://gist.github.com/) and create a new public gist.

  2. Name the file (e.g., "Recent Coding Languages") and add a description (e.g., "💻 Recent GitHub Activity Languages").

### 2. Generate a GitHub Token

  1. [Create a new Personal Access Token](https://github.com/settings/personal-access-tokens/new)

  2. Configure repository access:

     - For public repositories：Select **"Public Repositories (read-only)"**

     - For all repositories: Select **"All repositories"**

     - For specific repositories:

       1. Choose **"Only select repositories"**

       2. Select the desired repositories from the list

  3. Configure permissions:

     - Repository permissions > Metadata: Read-only

        - When selecting **"Public Repositories (read-only)"** no configuration is required.

     - Account permissions > Gists: Read and write

  3. Generate and copy the token for use in the next steps.

      Note: Ensure you save the token securely, as it won't be displayed again.

### 3. Set Up the Project
  1. Fork this repository or create a new one using the [template](https://github.com/new?template_name=recent-languages-box&template_owner=liby).

  2. Ensure GitHub Actions are enabled for your repository.

  3. Go to repository **Settings** > **Security** > **Actions secrets and variables** > **Secrets**, add the following environment variables:

      - `GH_TOKEN`: The GitHub token generated above.

  4. Go to repository **Settings** > **Security** > **Actions secrets and variables** > **Variables**, add the following environment variables:

      - `GIST_ID`: The ID of your gist (e.g., `914dd217cecdc3bf27960be421c95850` from https://gist.github.com/liby/914dd217cecdc3bf27960be421c95850)

### 4. Pin the Gist to Your Profile

Follow GitHub's guide on [pinning items to your profile](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/pinning-items-to-your-profile) to display your language stats.
