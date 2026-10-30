-- 三岔路聚合站：统一收藏表（function_backend 模式，accessPolicies 留空由 AppHub 生成固定私有策略）
-- 通过 sites-management 的 reviewed migration 流程提交；不随 Function 包上传。
CREATE TABLE app.favorites (
  owner_id   text NOT NULL,
  module     text NOT NULL,
  item_id    text NOT NULL,
  title      text NOT NULL,
  note       text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_id, module, item_id)
);
CREATE INDEX favorites_owner_created_idx ON app.favorites (owner_id, created_at);
