package rabbitmq

import (
	"github.com/rabbitmq/amqp091-go"
	"github.com/rs/zerolog"
)

type RabbitMQClient struct {
	conn    *amqp091.Connection
	channel *amqp091.Channel
	logger  zerolog.Logger
}

func NewRabbitMQClient(amqpURL string, logger zerolog.Logger) (*RabbitMQClient, error) {
	conn, err := amqp091.Dial(amqpURL)
	if err != nil {
		logger.Error().Err(err).Msg("Failed to connect to RabbitMQ")
		return nil, err
	}

	channel, err := conn.Channel()
	if err != nil {
		logger.Error().Err(err).Msg("Failed to open a channel")
		conn.Close()
		return nil, err
	}

	return &RabbitMQClient{
		conn:    conn,
		channel: channel,
		logger:  logger,
	}, nil
}

func (r *RabbitMQClient) DeclareExchangeAndQueue() error {
	err := r.channel.ExchangeDeclare(
		"nuclei_scans", // name
		"direct",       // type
		true,           // durable
		false,          // auto-deleted
		false,          // internal
		false,          // no-wait
		nil,            // arguments
	)
	if err != nil {
		r.logger.Error().Err(err).Msg("Failed to declare exchange")
		return err
	}

	_, err = r.channel.QueueDeclare(
		"nuclei_scan_queue", // name
		true,                // durable
		false,               // delete when unused
		false,               // exclusive
		false,               // no-wait
		nil,                 // arguments
	)
	if err != nil {
		r.logger.Error().Err(err).Msg("Failed to declare queue")
		return err
	}

	err = r.channel.QueueBind(
		"nuclei_scan_queue", // queue name
		"",                  // routing key
		"nuclei_scans",      // exchange
		false,
		nil,
	)
	if err != nil {
		r.logger.Error().Err(err).Msg("Failed to bind queue")
	}
	return err
}

func (r *RabbitMQClient) Publish(message []byte) error {
	err := r.channel.Publish(
		"nuclei_scans", // exchange
		"",             // routing key
		false,          // mandatory
		false,          // immediate
		amqp091.Publishing{
			ContentType: "application/json",
			Body:        message,
		},
	)
	if err != nil {
		r.logger.Error().Err(err).Msg("Failed to publish message")
	}
	return err
}

func (r *RabbitMQClient) Consume() (<-chan amqp091.Delivery, error) {
	msgs, err := r.channel.Consume(
		"nuclei_scan_queue", // queue
		"",                  // consumer
		true,                // auto-ack
		false,               // exclusive
		false,               // no-local
		false,               // no-wait
		nil,                 // args
	)
	if err != nil {
		r.logger.Error().Err(err).Msg("Failed to register a consumer")
		return nil, err
	}
	return msgs, nil
}

func (r *RabbitMQClient) Close() {
	if err := r.channel.Close(); err != nil {
		r.logger.Error().Err(err).Msg("Failed to close channel")
	}
	if err := r.conn.Close(); err != nil {
		r.logger.Error().Err(err).Msg("Failed to close connection")
	}
}
