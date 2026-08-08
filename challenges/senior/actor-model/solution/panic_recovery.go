// Actor model with panic recovery.
//
// Extends the base actor loop so a panicking handler does NOT kill
// the process. The panic is caught, converted into an error reply
// (or crash signal), and the supervisor can restart the actor.

package main

import (
	"errors"
	"fmt"
	"time"
)

type msgEnvelope struct {
	msg   any
	reply chan any
}

type PanicRecoveringActor struct {
	name    string
	handler func(msg any) (any, error)
	mailbox chan msgEnvelope
	done    chan struct{}
}

func NewSafeActor(name string, handler func(any) (any, error)) *PanicRecoveringActor {
	a := &PanicRecoveringActor{
		name:    name,
		handler: handler,
		mailbox: make(chan msgEnvelope, 32),
		done:    make(chan struct{}),
	}
	go a.loop()
	return a
}

// loop: single goroutine, with recover() around each handler call.
// A panic becomes an error reply; the actor keeps running.
func (a *PanicRecoveringActor) loop() {
	defer close(a.done)
	for env := range a.mailbox {
		result, err := a.safeHandle(env.msg)
		if env.reply != nil {
			if err != nil {
				env.reply <- err
			} else {
				env.reply <- result
			}
		}
	}
}

// safeHandle runs the handler and recovers panics as errors.
func (a *PanicRecoveringActor) safeHandle(msg any) (result any, err error) {
	defer func() {
		if r := recover(); r != nil {
			// A panic is not a Go error; wrap it so Ask() callers
			// receive a normal error instead of a process crash.
			err = fmt.Errorf("actor %s panicked: %v", a.name, r)
		}
	}()
	return a.handler(msg)
}

func (a *PanicRecoveringActor) Ask(msg any, timeout time.Duration) (any, error) {
	reply := make(chan any, 1)
	select {
	case a.mailbox <- msgEnvelope{msg: msg, reply: reply}:
	case <-a.done:
		return nil, errors.New("actor stopped")
	}
	select {
	case r := <-reply:
		if e, ok := r.(error); ok {
			return nil, e
		}
		return r, nil
	case <-time.After(timeout):
		return nil, errors.New("actor timeout")
	}
}

func (a *PanicRecoveringActor) Stop() {
	select {
	case <-a.done:
		return
	default:
	}
	close(a.mailbox)
	<-a.done
}

func main() {
	actor := NewSafeActor("panic-demo", func(msg any) (any, error) {
		if msg == "panic" {
			// Simulate a nil dereference inside the handler
			var p *int
			return *p, nil // panics!
		}
		return "ok:" + fmt.Sprint(msg), nil
	})

	// This would crash the process without recover()
	_, err := actor.Ask("panic", time.Second)
	fmt.Println("panic handled ->", err)

	// Actor is STILL ALIVE after the panic
	reply, err := actor.Ask("still-alive", time.Second)
	fmt.Println("after panic ->", reply, err)

	actor.Stop()
	fmt.Println("actor stopped cleanly")
}
