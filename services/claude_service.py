import os
from anthropic import Anthropic


class ClaudeService:
    def __init__(self, api_key: str = None):
        """
        Inicializa el cliente de Claude.
        """
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")

        if not self.api_key:
            raise ValueError("Falta la API KEY de Anthropic")

        self.client = Anthropic(api_key=self.api_key)

    def generate_response(
        self,
        prompt: str,
        model: str = "claude-3-sonnet-20240229",
        max_tokens: int = 1000,
        temperature: float = 0.7
    ) -> str:
        """
        Genera una respuesta usando Claude.
        """

        try:
            response = self.client.messages.create(
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            return response.content[0].text

        except Exception as e:
            return f"Error al generar respuesta: {str(e)}"


# 🔥 Uso rápido (para pruebas)
if __name__ == "__main__":
    service = ClaudeService()

    prompt = "Explícame qué es la inteligencia artificial en términos simples"

    respuesta = service.generate_response(prompt)

    print("\nRespuesta:\n")
    print(respuesta)