import io
from PIL import Image


def create_test_image_bytes():
    file = io.BytesIO()
    img = Image.new("RGB", (200, 200), color=(180, 140, 100))
    img.save(file, "JPEG")
    file.seek(0)
    return file.read()


def test_ai_preview_styles_list(client):
    response = client.get("/api/v1/ai-preview/styles")
    assert response.status_code == 200
    data = response.json()
    assert "hairstyles" in data
    assert "hair_colors" in data
    assert len(data["hairstyles"]) > 0
    assert len(data["hair_colors"]) > 0


def test_ai_preview_transformation_success(client):
    img_bytes = create_test_image_bytes()
    response = client.post(
        "/api/v1/ai-preview/transform",
        data={
            "hairstyle": "Textured Crop Fade",
            "hair_color": "Burgundy Wine",
            "consent_given": "true"
        },
        files={
            "file": ("portrait.jpg", img_bytes, "image/jpeg")
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["is_mock"] is True
    assert "preview_url" in data
    assert data["hairstyle"] == "Textured Crop Fade"


def test_ai_preview_fails_without_consent(client):
    img_bytes = create_test_image_bytes()
    response = client.post(
        "/api/v1/ai-preview/transform",
        data={
            "hairstyle": "Textured Crop Fade",
            "hair_color": "Natural Black",
            "consent_given": "false"
        },
        files={
            "file": ("portrait.jpg", img_bytes, "image/jpeg")
        }
    )
    assert response.status_code == 400
    assert "consent" in response.json()["detail"].lower()
