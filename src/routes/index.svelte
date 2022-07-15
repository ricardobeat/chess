<script lang="ts">
  import "../../node_modules/@chrisoakman/chessboardjs/dist/chessboard-1.0.0.css";
  import { onMount } from "svelte";
  import { createClient, SupabaseClient } from "@supabase/supabase-js";

  let player = "white";

  type Game = {
    p1: string[];
    p2: string[];
    gameId: string | null;
  };

  let gameId: string | null;
  let p1Moves: string[] = [];
  let p2Moves: string[] = [];

  let supabase: SupabaseClient;
  let board: any;

  onMount(async () => {
    const SUP_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxcnRsaGhwcmpiamJ5bnhvcHpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTc4OTk3MTEsImV4cCI6MTk3MzQ3NTcxMX0.ee77Y9MhyfB2ARiTuzJSLE0tpfmXwUCpZjcKeUS_Wtk";
    supabase = createClient("https://pqrtlhhprjbjbynxopzs.supabase.co", SUP_KEY);

    let params = new URLSearchParams(window.location.search);

    if (params.get("game")) {
      // join game
      player = "black";
      let id = params.get("game");
      await supabase
        .from("games")
        .select("*")
        .eq("id", id)
        .then((payload) => {
          console.log("join game", payload);
          gameId = id;
        });
    } else {
      // start new game
      await supabase
        .from("games")
        .insert([{ p1: name, p2: null }])
        .then((payload) => {
          gameId = payload.data?.[0].id;
          window.history.pushState({ gameId }, "", `?game=${gameId}`);
          console.log("create game", payload);
        });
    }

    supabase
      .from("moves")
      .on("INSERT", (payload) => {
        const data = payload.new;
        console.log("received move", payload);
        if (data.player !== player) {
          p2Moves = [...p2Moves, data.move];
          board.move(data.move);
        }
      })
      .subscribe();
  });

  function chessboard(node: Node) {
    const Chessboard = (window as any).Chessboard;
    board = Chessboard(node, {
      pieceTheme: "https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png",
      position: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
      draggable: true,
      onDrop: updateMove,
      onDragStart: (a: any, b: any, c: any, side: string) => {
        console.log(a, b, c);
        return side !== player;
      },
    });

    async function updateMove(from: string, to: string) {
      const move = `${from}-${to}`;
      const payload = { game_id: gameId, player, move };
      p1Moves = [...p1Moves, move];
      await supabase
        .from("moves")
        .insert(payload)
        .then((payload) => {
          console.log(payload);
        });
    }
  }

  function move() {}
</script>

<h1>chess</h1>

<div use:chessboard style="width: 400px" />
<pre>{JSON.stringify(p1Moves)}</pre>
<pre>{JSON.stringify(p2Moves)}</pre>

<svelte:head>
  <script
    src="https://code.jquery.com/jquery-3.5.1.min.js"
    integrity="sha384-ZvpUoO/+PpLXR1lu4jmpXWu80pZlYUAfxl5NsBMWOEPSjUn/6Z/hRTt8+pR6L4N2"
    crossorigin="anonymous"></script>

  <script
    src="https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.js"
    integrity="sha384-8Vi8VHwn3vjQ9eUHUxex3JSN/NFqUg3QbPyX8kWyb93+8AC/pPWTzj+nHtbC5bxD"
    crossorigin="anonymous"></script>
</svelte:head>
