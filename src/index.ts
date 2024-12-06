import { PullRequest, PullRequestResponse } from "../types/response";

const labelCheck = (labels) => {
  const LABEL_NAME = process.env.LABEL_NAME;

  for (const l of labels) {
    if (l.name == LABEL_NAME) return true;
  }
  return false;
}

const postSlack = async (pullRequests: PullRequest[]) => {

  const slackUrl = 'https://slack.com/api/chat.postMessage';
  const SLACK_TOKEN = process.env.SLACK_TOKEN;

  // レビュー一覧のElements
  const elements: Array<any> = [
    {
      "type": "rich_text_section",
      "elements": [
        {
          "type": "text",
          "text": "お手隙にレビューをお願いします！\n"
        }
      ]
    },
  ];

  // PRの情報をelementsに埋め込む
  for (const pr of pullRequests) {
    elements.push(
      {
        "type": "rich_text_list",
        "style": "bullet",
        "elements": [
          {
            "type": "rich_text_section",
            "elements": [
              {
                "type": "link",
                "url": pr.url,
                "text": pr.title,
                "style": {
                  "bold": true
                }
              }
            ]
          }
        ]
      }
    )
  }

  // メッセージとして用いるblocks
  const blocks = [
		{
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": "今日のレビューリマインド"
			}
		},
		{
			"type": "divider"
		},
		{
			"type": "rich_text",
			"elements": elements
		}
	];


  const body = JSON.stringify({
    "channel": process.env.SLACK_CHANNEL,
    "blocks": blocks
  });

  // console.log(body);

  const response = await fetch(
    slackUrl,
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SLACK_TOKEN}`,
      },
      method: "POST",
      body: body,
    },
  );
  console.log(response);
  return;
}

export const handler = async () => {
  const REPO = process.env.REPO;
  const OWNER = process.env.OWNER
  const API_TOKEN = process.env.API_TOKEN
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/pulls?state=open`

  const response = await fetch(
    url,
    {
      headers: {
        Authorization: `token ${API_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );
  if (response.status != 200) {
    throw new Error(
      `GitHub API にアクセスできませんでした: ${JSON.stringify(
        await response.json(),
        null,
        '  '
      )}`
    );
  }

  const result: PullRequestResponse = await response.json();
  // Responseの形式: https://docs.github.com/ja/rest/pulls/pulls?apiVersion=2022-11-28#list-pull-requests

  var pullRequests: PullRequest[] = [];

  result.map((r) => {
    const containTargetLabel: boolean = labelCheck(r.labels);
    if (containTargetLabel) {
      pullRequests.push({
        title: r.title,
        url: r.url,
      })
    }
  })

  const R = await postSlack(pullRequests);
  return R;
};
