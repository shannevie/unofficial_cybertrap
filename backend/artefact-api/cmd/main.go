package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/httplog"
	_ "github.com/lib/pq"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/shannevie/unofficial_cybertrap/config"
	handler "github.com/shannevie/unofficial_cybertrap/internal/delivery/http"
	r "github.com/shannevie/unofficial_cybertrap/internal/repository"
	s "github.com/shannevie/unofficial_cybertrap/internal/service"
)

func main() {
	// load env configurations
	config, err := config.LoadAppConfig(".")
	if err != nil {
		log.Fatal().Err(err).Msg("unable to load configurations")
	}

	// configurations for the logger middleware
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	httplog.Configure(httplog.Options{Concise: true, TimeFieldFormat: time.DateTime})

	// Prepare db or external connections

	router := chi.NewRouter()

	// middleware
	router.Use(httplog.RequestLogger(log.Logger))
	router.Use(middleware.Timeout(60 * time.Second))
	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Recoverer)

	// repositories DI
	artefactRepo := r.NewArtefactRepository()

	// service DI
	artefactService := s.NewArtefactService(artefactRepo)

	// HTTP handlers
	handler.NewArtefactHandler(router, *artefactService)

	// Start the server
	server := &http.Server{
		Addr:    config.ServeAddress,
		Handler: router,
	}

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("failed to start server")
		}
	}()

	// graceful shutdown
	waitForShutdown(server)
}

// waitForShutdown graceful shutdown
func waitForShutdown(server *http.Server) {
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, os.Interrupt, syscall.SIGTERM)
	<-sig

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatal().Err(err).Msg("failed to gracefully shut down server")
	}
}
