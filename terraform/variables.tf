variable "kubeconfig_path" {
  type    = string
  default = "~/.kube/config"
}

variable "slack_webhook_url" {
  type      = string
  sensitive = true
}
