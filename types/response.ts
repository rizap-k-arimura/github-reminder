export type PullRequestResponse = {
  url: string
  title: string
  labels: {
    id: number
    name: string
  }[]
}[]

export type PullRequest = {
  title: string
  url: string
}
